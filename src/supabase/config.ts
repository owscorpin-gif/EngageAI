import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── Supabase Client Configuration ──────────────────────────────────────────
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are public-facing by design.
// Security is enforced via Supabase Row Level Security (RLS) policies,
// NOT by keeping these values secret.
// See: https://supabase.com/docs/guides/getting-started/architecture#api-keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ─── Validate configuration ──────────────────────────────────────────────────
const isConfigValid =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('https://') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

let supabase: SupabaseClient | null = null;
let isMockAuth = false;

if (isConfigValid) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch {
    isMockAuth = true;
  }
} else {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[Engage AI] Supabase credentials not configured. Running in Mock Auth Mode.');
  }
  isMockAuth = true;
}

export { supabase, isMockAuth };
