/** Where to go after signing in: only paths inside the admin, never another site ("//evil.example"). */
export function safeAdminPath(next: string | null | undefined, fallback = "/admin") {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) return fallback;
  if (next.startsWith("/admin/login")) return fallback;
  return next;
}
