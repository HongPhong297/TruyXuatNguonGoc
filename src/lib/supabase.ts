/**
 * Supabase client instances — server-side và browser-side
 * Server: dùng Service Role key (có full access, chỉ dùng trong Server Actions/Route Handlers)
 * Browser: dùng Anon key (RLS rules áp dụng)
 */
import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin client — server-only, dùng service role key (bypass RLS)
 * Dùng cho: seeding, admin ops, ETL
 */
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Server client — server-only, dùng session cookie từ request
 * Dùng trong: Server Components, Server Actions, Route Handlers
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

/**
 * Browser client — client-side only
 * Dùng trong: Client Components
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
