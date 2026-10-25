import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True only when both env vars are set. Otherwise the app stays localStorage-only. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Quick login (test phase): a shared TEST client account so a phone can open the app as a client
 * with one tap, no typing. The coach logs in once per device and stays signed in.
 * Values come from GitHub Actions Variables (never from git) and end up in the public app, so the
 * test client must be a throwaway client with no private data. Leave them unset to turn it off.
 */
export const testClient = {
  email: (import.meta.env.VITE_TEST_CLIENT_EMAIL as string | undefined) ?? '',
  password: (import.meta.env.VITE_TEST_CLIENT_PASSWORD as string | undefined) ?? '',
};
export const isQuickLoginOn =
  isSupabaseConfigured && Boolean(testClient.email && testClient.password);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
