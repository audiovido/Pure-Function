import { supabase } from './supabaseClient';
import { AuthAccount } from '../types';

export interface AuthResult {
  account?: AuthAccount;
  error?: string;
  /** true when sign-up succeeded but the user must confirm their email first */
  needsConfirmation?: boolean;
}

/** Build the app's AuthAccount from the current Supabase session + profile row. */
export async function getCurrentAccount(): Promise<AuthAccount | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, display_name, client_id')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    id: user.id,
    username: user.email ?? '',
    password: '', // credentials live in Supabase Auth only
    role: profile.role,
    displayName: profile.display_name || user.email || '',
    email: user.email ?? '',
    clientId: profile.client_id ?? undefined,
  };
}

const NO_PROFILE_MSG =
  "This email isn't linked to a coach yet. Ask your trainer to add your email to your client profile, then try again.";

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Cloud login is not configured.' };
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { error: error.message };

  const account = await getCurrentAccount();
  if (!account) {
    await supabase.auth.signOut();
    return { error: NO_PROFILE_MSG };
  }
  return { account };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  if (!supabase) return { error: 'Cloud login is not configured.' };
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });
  if (error) return { error: error.message };

  // With email confirmation on (recommended) there is no session yet.
  if (!data.session) return { needsConfirmation: true };

  const account = await getCurrentAccount();
  if (!account) {
    await supabase.auth.signOut();
    return { error: NO_PROFILE_MSG };
  }
  return { account };
}

export async function signOutCloud(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}
