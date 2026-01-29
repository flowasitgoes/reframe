import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required. This module must only be used on the server."
  );
}

if (!url) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is required for the Supabase server client."
  );
}

/**
 * Supabase client using the service role key. Use ONLY in server code
 * (API routes, Server Components, Server Actions). Never import from the client.
 */
export const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
