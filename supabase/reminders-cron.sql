-- Schedule the daily reminder email (run once in the SQL Editor, after deploying the function).
-- Replace <PROJECT_REF> and <CRON_SECRET> (same value you set with `supabase secrets set`).
-- 12:00 UTC = 8:00 in New York (EDT) / 7:00 (EST). Adjust the cron expression to taste.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'pf-daily-reminders',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-reminders',
    headers := jsonb_build_object('x-cron-secret', '<CRON_SECRET>')
  );
  $$
);

-- To stop it:  select cron.unschedule('pf-daily-reminders');
