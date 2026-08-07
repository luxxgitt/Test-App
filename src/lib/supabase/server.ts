import { cookies } from "next/headers";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import type { Database } from "@/lib/types";

/**
 * Supabase client for use in Server Components, Route Handlers and Server
 * Actions. Reads/writes the session via cookies. Still only uses the public
 * anon key — access to owner data is enforced by RLS via the user's session,
 * never by a service-role key.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component during render — the middleware
            // already refreshes the session, so this can be safely ignored.
          }
        },
      },
    }
  );
}
