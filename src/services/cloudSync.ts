import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  ClientProfile,
  DailyNutritionEntry,
  DayWorkout,
  DirectMessage,
} from '../types';

/**
 * Cloud sync layer. The app still holds everything in React state/localStorage;
 * this mirrors it to Supabase (write-through, only changed rows) and can pull
 * the latest data on startup. All functions are no-ops when Supabase is not configured.
 */

// last JSON pushed per row, so we only upsert what changed
const pushed = new Map<string, string>();

async function upsertChanged(
  table: string,
  rows: { key: string; row: Record<string, unknown>; json: string }[],
  onConflict: string
) {
  if (!supabase) return;
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return; // not signed in: RLS would reject the write anyway
  const changed = rows.filter((r) => pushed.get(`${table}:${r.key}`) !== r.json);
  if (changed.length === 0) return;
  // chunk to keep requests small
  for (let i = 0; i < changed.length; i += 200) {
    const chunk = changed.slice(i, i + 200);
    const { error } = await supabase
      .from(table)
      .upsert(chunk.map((c) => c.row), { onConflict });
    if (error) {
      console.error(`[cloudSync] ${table} upsert failed:`, error.message);
      return;
    }
    chunk.forEach((c) => pushed.set(`${table}:${c.key}`, c.json));
  }
}

export async function pushClients(clients: ClientProfile[]) {
  await upsertChanged(
    'clients',
    clients.map((c) => {
      // never send plaintext passwords to the cloud; Supabase Auth owns credentials
      const { password: _pw, ...safe } = c;
      const json = JSON.stringify(safe);
      return { key: c.id, json, row: { id: c.id, data: safe, updated_at: new Date().toISOString() } };
    }),
    'id'
  );
}

export async function pushWorkouts(map: Record<string, DayWorkout[]>) {
  const rows = Object.entries(map).flatMap(([clientId, days]) =>
    days.map((d) => {
      const json = JSON.stringify(d);
      return {
        key: `${clientId}:${d.date}`,
        json,
        row: { client_id: clientId, date: d.date, data: d, updated_at: new Date().toISOString() },
      };
    })
  );
  await upsertChanged('workouts', rows, 'client_id,date');
}

export async function pushNutrition(
  map: Record<string, Record<string, DailyNutritionEntry>>
) {
  const rows = Object.entries(map).flatMap(([clientId, days]) =>
    Object.values(days).map((d) => {
      const json = JSON.stringify(d);
      return {
        key: `${clientId}:${d.date}`,
        json,
        row: { client_id: clientId, date: d.date, data: d, updated_at: new Date().toISOString() },
      };
    })
  );
  await upsertChanged('nutrition', rows, 'client_id,date');
}

export async function pushMessages(map: Record<string, DirectMessage[]>) {
  const rows = Object.entries(map).flatMap(([clientId, msgs]) =>
    msgs.map((m) => {
      const json = JSON.stringify(m);
      return {
        key: m.id,
        json,
        row: { id: m.id, client_id: clientId, data: m, created_at: m.timestamp },
      };
    })
  );
  await upsertChanged('messages', rows, 'id');
}

export interface CloudSnapshot {
  clients: ClientProfile[];
  workouts: Record<string, DayWorkout[]>;
  nutrition: Record<string, Record<string, DailyNutritionEntry>>;
  messages: Record<string, DirectMessage[]>;
}

function group<T>(rows: { client_id: string; data: T }[]): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const r of rows) (out[r.client_id] ||= []).push(r.data);
  return out;
}

function groupByDate<T extends { date: string }>(
  rows: { client_id: string; data: T }[]
): Record<string, Record<string, T>> {
  const out: Record<string, Record<string, T>> = {};
  for (const r of rows) (out[r.client_id] ||= {})[r.data.date] = r.data;
  return out;
}

/** Pull everything the signed-in user is allowed to see (RLS filters server-side). */
export async function pullAll(): Promise<CloudSnapshot | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const [c, w, n, m] = await Promise.all([
    supabase.from('clients').select('id,data'),
    supabase.from('workouts').select('client_id,data'),
    supabase.from('nutrition').select('client_id,data'),
    supabase.from('messages').select('client_id,data').order('created_at'),
  ]);
  const err = c.error || w.error || n.error || m.error;
  if (err) {
    console.error('[cloudSync] pull failed:', err.message);
    return null;
  }
  const workouts = group<DayWorkout>(w.data as any);
  Object.values(workouts).forEach((l) => l.sort((a, b) => a.date.localeCompare(b.date)));
  const clients = (c.data ?? []).map((r: any) => r.data as ClientProfile);
  // seed push-cache so we don't immediately re-upload what we just downloaded
  clients.forEach((x) => pushed.set(`clients:${x.id}`, JSON.stringify(x)));
  (w.data ?? []).forEach((r: any) =>
    pushed.set(`workouts:${r.client_id}:${r.data.date}`, JSON.stringify(r.data))
  );
  (n.data ?? []).forEach((r: any) =>
    pushed.set(`nutrition:${r.client_id}:${r.data.date}`, JSON.stringify(r.data))
  );
  (m.data ?? []).forEach((r: any) =>
    pushed.set(`messages:${r.data.id}`, JSON.stringify(r.data))
  );
  return {
    clients,
    workouts,
    nutrition: groupByDate<DailyNutritionEntry>(n.data as any),
    messages: group<DirectMessage>(m.data as any),
  };
}

/** Remove a client and all of their data (trainer only; enforced by RLS). */
export async function deleteClientCloud(clientId: string): Promise<boolean> {
  if (!supabase) return false;
  for (const table of ['messages', 'nutrition', 'workouts']) {
    const { error } = await supabase.from(table).delete().eq('client_id', clientId);
    if (error) {
      console.error(`[cloudSync] delete from ${table} failed:`, error.message);
      return false;
    }
  }
  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) {
    console.error('[cloudSync] delete client failed:', error.message);
    return false;
  }
  // forget cached rows so a re-added client is uploaded again
  for (const key of [...pushed.keys()]) {
    if (key === `clients:${clientId}` || key.includes(`:${clientId}:`)) pushed.delete(key);
  }
  return true;
}
