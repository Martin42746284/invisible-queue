-- =========================================================
-- INVISIBLE QUEUE — schema, RLS, RPC, triggers
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- TABLES ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create type queue_status as enum ('open','paused','closed');
create type entry_status as enum ('waiting','served','missed','cancelled','excluded');

create table if not exists public.queues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_m integer not null check (radius_m between 50 and 20000),
  avg_time_per_person_s integer not null check (avg_time_per_person_s between 10 and 3600),
  status queue_status not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists queues_status_idx on public.queues(status);
create index if not exists queues_geo_idx on public.queues(latitude, longitude);

create table if not exists public.queue_entries (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.queues(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  guest_name text,
  guest_email text,
  position integer not null,
  status entry_status not null default 'waiting',
  missed_count integer not null default 0,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or (guest_name is not null and guest_email is not null))
);
create index if not exists entries_queue_status_pos on public.queue_entries(queue_id, status, position);
create unique index if not exists entries_queue_user_active
  on public.queue_entries(queue_id, user_id) where status = 'waiting' and user_id is not null;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  entry_id uuid references public.queue_entries(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- HELPERS ----------

create or replace function public.haversine_m(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision language sql immutable as $$
  select 2 * 6371000 * asin(sqrt(
    pow(sin(radians(lat2 - lat1)/2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    pow(sin(radians(lng2 - lng1)/2), 2)
  ));
$$;

-- ---------- TRIGGER : auto profile on signup ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- TRIGGER : updated_at ----------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists trg_entries_updated on public.queue_entries;
create trigger trg_entries_updated before update on public.queue_entries
  for each row execute function public.touch_updated_at();

-- ---------- RPC : list_nearby_queues ----------

create or replace function public.list_nearby_queues(
  p_lat double precision, p_lng double precision, p_radius_m integer
) returns table (
  id uuid, name text, latitude double precision, longitude double precision,
  radius_m integer, avg_time_per_person_s integer, status queue_status,
  people_count bigint, estimated_wait_s bigint, distance_m double precision
) language sql stable as $$
  select q.id, q.name, q.latitude, q.longitude, q.radius_m, q.avg_time_per_person_s, q.status,
    coalesce(c.cnt, 0) as people_count,
    coalesce(c.cnt, 0) * q.avg_time_per_person_s as estimated_wait_s,
    public.haversine_m(p_lat, p_lng, q.latitude, q.longitude) as distance_m
  from public.queues q
  left join (
    select queue_id, count(*)::bigint as cnt
    from public.queue_entries where status = 'waiting' group by queue_id
  ) c on c.queue_id = q.id
  where q.status = 'open'
    and public.haversine_m(p_lat, p_lng, q.latitude, q.longitude) <= p_radius_m
  order by distance_m asc;
$$;

-- ---------- RPC : queue_stats ----------

create or replace function public.queue_stats(p_queue_id uuid)
returns table (people_count bigint, estimated_wait_s bigint)
language sql stable as $$
  select coalesce(count(e.*), 0)::bigint,
    (coalesce(count(e.*), 0) * q.avg_time_per_person_s)::bigint
  from public.queues q
  left join public.queue_entries e on e.queue_id = q.id and e.status = 'waiting'
  where q.id = p_queue_id
  group by q.id, q.avg_time_per_person_s;
$$;

-- ---------- RPC : join_queue (with GPS check) ----------

create or replace function public.join_queue(
  p_queue_id uuid, p_user_lat double precision, p_user_lng double precision,
  p_guest_name text default null, p_guest_email text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_queue public.queues;
  v_dist double precision;
  v_uid uuid := auth.uid();
  v_pos integer;
  v_id uuid;
begin
  select * into v_queue from public.queues where id = p_queue_id;
  if not found then raise exception 'Queue not found'; end if;
  if v_queue.status <> 'open' then raise exception 'Queue is not open'; end if;

  v_dist := public.haversine_m(p_user_lat, p_user_lng, v_queue.latitude, v_queue.longitude);
  if v_dist > v_queue.radius_m then
    raise exception 'Out of range (% m, max % m)', round(v_dist), v_queue.radius_m;
  end if;

  if v_uid is null and (p_guest_name is null or p_guest_email is null) then
    raise exception 'Guest must provide name and email';
  end if;

  if v_uid is not null and exists (
    select 1 from public.queue_entries where queue_id = p_queue_id and user_id = v_uid and status = 'waiting'
  ) then
    raise exception 'Already in this queue';
  end if;

  select coalesce(max(position), 0) + 1 into v_pos
  from public.queue_entries where queue_id = p_queue_id and status = 'waiting';

  insert into public.queue_entries (queue_id, user_id, guest_name, guest_email, position, status)
  values (p_queue_id, v_uid, p_guest_name, p_guest_email, v_pos, 'waiting')
  returning id into v_id;

  return v_id;
end; $$;

-- ---------- RPC : leave_queue ----------

create or replace function public.leave_queue(p_entry_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_qid uuid; v_pos integer; v_uid uuid := auth.uid();
begin
  select queue_id, position into v_qid, v_pos
  from public.queue_entries where id = p_entry_id;
  if not found then raise exception 'Entry not found'; end if;

  -- (les invités peuvent quitter via leur entry id ; les users connectés via RLS)
  update public.queue_entries set status = 'cancelled' where id = p_entry_id;

  update public.queue_entries
  set position = position - 1
  where queue_id = v_qid and status = 'waiting' and position > v_pos;
end; $$;

-- ---------- RPC : serve_next ----------

create or replace function public.serve_next(p_queue_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_entry public.queue_entries;
begin
  if not exists (select 1 from public.queues where id = p_queue_id and owner_id = auth.uid()) then
    raise exception 'Forbidden';
  end if;

  select * into v_entry from public.queue_entries
  where queue_id = p_queue_id and status = 'waiting'
  order by position asc limit 1;

  if not found then return; end if;

  update public.queue_entries set status = 'served' where id = v_entry.id;

  update public.queue_entries
  set position = position - 1
  where queue_id = p_queue_id and status = 'waiting' and position > v_entry.position;
end; $$;

-- ---------- RPC : mark_missed ----------
-- Pousse l'entrée de 3 places, increment missed_count, exclut si > 3

create or replace function public.mark_missed(p_entry_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_entry public.queue_entries;
  v_max integer;
  v_new_pos integer;
begin
  select * into v_entry from public.queue_entries where id = p_entry_id;
  if not found then raise exception 'Entry not found'; end if;

  if not exists (select 1 from public.queues where id = v_entry.queue_id and owner_id = auth.uid()) then
    raise exception 'Forbidden';
  end if;

  if v_entry.missed_count + 1 > 3 then
    update public.queue_entries set status = 'excluded', missed_count = missed_count + 1
    where id = p_entry_id;
    -- combler la position
    update public.queue_entries set position = position - 1
    where queue_id = v_entry.queue_id and status = 'waiting' and position > v_entry.position;
    return;
  end if;

  select coalesce(max(position), 0) into v_max
  from public.queue_entries where queue_id = v_entry.queue_id and status = 'waiting';

  v_new_pos := least(v_entry.position + 3, v_max);

  -- décale les entrées entre old+1 et new_pos vers le haut
  update public.queue_entries set position = position - 1
  where queue_id = v_entry.queue_id and status = 'waiting'
    and position > v_entry.position and position <= v_new_pos;

  update public.queue_entries
  set position = v_new_pos, missed_count = missed_count + 1, status = 'waiting'
  where id = p_entry_id;
end; $$;

-- ---------- RLS ----------

alter table public.profiles enable row level security;
alter table public.queues enable row level security;
alter table public.queue_entries enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- queues
create policy "queues_select_all" on public.queues for select using (true);
create policy "queues_insert_owner" on public.queues for insert
  with check (auth.uid() is not null and owner_id = auth.uid());
create policy "queues_update_owner" on public.queues for update using (owner_id = auth.uid());
create policy "queues_delete_owner" on public.queues for delete using (owner_id = auth.uid());

-- queue_entries
-- lecture publique (anonymes voient la file)
create policy "entries_select_all" on public.queue_entries for select using (true);
-- inserts via RPC join_queue (security definer) — pas besoin d'INSERT direct
-- mises à jour : owner de la file ou propriétaire de l'entrée
create policy "entries_update_self_or_owner" on public.queue_entries for update using (
  (user_id is not null and user_id = auth.uid())
  or exists (select 1 from public.queues q where q.id = queue_id and q.owner_id = auth.uid())
);
create policy "entries_delete_self_or_owner" on public.queue_entries for delete using (
  (user_id is not null and user_id = auth.uid())
  or exists (select 1 from public.queues q where q.id = queue_id and q.owner_id = auth.uid())
);

-- notifications
create policy "notif_select_own" on public.notifications for select using (user_id = auth.uid());

-- ---------- REALTIME ----------

alter publication supabase_realtime add table public.queues;
alter publication supabase_realtime add table public.queue_entries;
alter publication supabase_realtime add table public.notifications;