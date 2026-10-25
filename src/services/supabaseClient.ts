import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Login freeze (test mode). ON by default: the app skips email/password login and the cloud,
 * and opens straight into a Coach / Client chooser using browser-only (localStorage) data.
 * All the Supabase code stays in place. To bring real login back, build with
 * VITE_FREEZE_LOGIN=false (on GitHub: Settings > Secrets and variables > Actions > Variables).
 */
export const isLoginFrozen =
  (import.meta.env.VITE_FREEZE_LOGIN as string | undefined) !== 'false';

/** True only when both env vars are set and the login freeze is off. Otherwise the app stays localStorage-only. */
export const isSupabaseConfigured = Boolean(url && anonKey) && !isLoginFrozen;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
