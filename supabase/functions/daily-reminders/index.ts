// Supabase Edge Function (Deno): emails each client their workout for today.
// Deploy:  supabase functions deploy daily-reminders --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=... FROM_EMAIL="Coach <coach@yourdomain.com>" \
//            APP_URL=https://... COACH_TIMEZONE=America/New_York CRON_SECRET=<random string>
// Schedule: see supabase/reminders-cron.sql
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildReminderEmails, localDateKey } from './logic.ts';

Deno.serve(async (req) => {
  // only the scheduler (which knows the secret) may trigger sends
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('forbidden', { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // server-side only; bypasses RLS to read all clients
  );
  const today = localDateKey(new Date(), Deno.env.get('COACH_TIMEZONE') ?? 'America/New_York');

  const [{ data: clients, error: e1 }, { data: workouts, error: e2 }, { data: trainer }] = await Promise.all([
    supabase.from('clients').select('id, data'),
    supabase.from('workouts').select('client_id, data').eq('date', today),
    supabase.from('profiles').select('display_name').eq('role', 'trainer').maybeSingle(),
  ]);
  if (e1 || e2) return new Response(`db error: ${(e1 ?? e2)!.message}`, { status: 500 });

  const emails = buildReminderEmails(
    (clients ?? []).map((r) => r.data),
    workouts ?? [],
    Deno.env.get('APP_URL') ?? '',
    trainer?.display_name || 'Your coach'
  );

  const dryRun = new URL(req.url).searchParams.get('dry') === '1';
  let sent = 0;
  const failures: string[] = [];
  for (const email of emails) {
    if (dryRun) continue;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: Deno.env.get('FROM_EMAIL'), ...email }),
    });
    if (res.ok) sent++;
    else failures.push(`${email.to}: ${res.status}`);
  }

  return Response.json({ date: today, candidates: emails.length, sent, failures, dryRun });
});
