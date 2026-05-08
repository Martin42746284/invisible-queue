# Invisible Queue

Application mobile React Native (Expo) + Supabase pour la gestion de files virtuelles.

## Stack
- Expo SDK 51, React Native 0.74, TypeScript strict
- Expo Router, NativeWind, Zustand, TanStack Query, React Hook Form + Zod
- Supabase (Auth, Postgres, RLS, Realtime, RPC)

## Démarrage

```bash
npm install
cp .env.example .env   # remplir SUPABASE_URL et SUPABASE_ANON_KEY
npx expo start -c
```

Scanner le QR avec Expo Go (iOS/Android) ou lancer un emulateur.

## Backend
1. Créer un projet Supabase
2. Coller `supabase/migrations/0001_init.sql` dans SQL Editor → Run
3. Activer Realtime sur `queues`, `queue_entries`, `notifications`
4. Copier URL et anon key dans `.env`

## Fonctionnalités
- Auth email/password + mode invité
- Géolocalisation et filtrage par rayon (haversine)
- Création / consultation / participation aux files en temps réel
- Suivi de position avec notifications internes (3 personnes restantes)
- Règles métier serveur :
  - Tour servi → suppression
  - Tour manqué → recul de 3 places + missed_count++
  - missed_count > 3 → exclusion automatique
- RLS strict, RPC `security definer` pour les écritures sensibles

## Architecture
```
src/
  app/          routes Expo Router
  components/   UI réutilisable
  features/     hooks par domaine (queues, auth)
  services/     accès Supabase
  hooks/        location, distance, notifications
  store/        Zustand (auth, guest)
  providers/    Query, Auth, Notifications
  utils/        geo, format, errors
  types/        modèles DB
  validations/  schémas Zod
  constants/    config + thème
```

## Production
- `eas build --platform android` / `eas build --platform ios`
- Vérifier permissions GPS et notifications dans `app.json`
```

---

## Notes finales

- **Tout le code est complet, sans TODO.**
- Les écritures sensibles passent par des **RPC `security definer`** (anti-abus côté client, validation GPS serveur).
- Le **Realtime Supabase** est branché sur les hooks `useQueue`, `useQueueEntries`, `useMyEntryById` — aucun refresh manuel.
- La règle **missed_count > 3 → exclusion** est implémentée serveur dans `mark_missed`.
- Les **invités** sont supportés via `guest_name` / `guest_email` + persistance AsyncStorage de `activeEntryId`.
- Les **policies RLS** bloquent toute écriture directe sur `queue_entries` ; seules les RPC peuvent insérer.

Lance `npx create-expo-app` puis copie chaque fichier à son chemin exact, exécute le SQL dans Supabase, remplis `.env`, et `npx expo start -c`. Le projet tourne.