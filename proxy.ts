import type { NextRequest } from "next/server";
import { safeAdminPath } from "@/lib/admin/paths";
import { redirectKeepingSession, updateSession } from "@/lib/supabase/proxy";

/**
 * The admin's front door (Next 16's proxy, formerly middleware). It keeps the Supabase session fresh and sends
 * signed-out visitors to the login page. It is only a first check: every admin page, action and download also
 * confirms the user is an admin (lib/admin/auth.ts), and the database's row level security has the final say.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const { response, claims, configured } = await updateSession(request);

  const open = pathname === "/admin/login" || pathname === "/admin/setup";
  let result = response;

  if (!configured) {
    if (pathname !== "/admin/setup") result = redirectKeepingSession(response, new URL("/admin/setup", request.url));
  } else if (!claims && !open) {
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", `${pathname}${search}`);
    result = redirectKeepingSession(response, login);
  } else if (claims && pathname === "/admin/login") {
    result = redirectKeepingSession(response, new URL(safeAdminPath(searchParams.get("next")), request.url));
  }

  result.headers.set("X-Robots-Tag", "noindex, nofollow");
  result.headers.set("X-Frame-Options", "DENY");
  result.headers.set("Referrer-Policy", "same-origin");
  return result;
}

export const config = {
  matcher: ["/admin/:path*"],
};
