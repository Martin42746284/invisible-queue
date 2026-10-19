export const getErrorMessage = (e: unknown): string => {
  if (!e) return "Erreur inconnue";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && "message" in (e as any)) return String((e as any).message);
  return "Erreur inconnue";
};