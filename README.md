# Pure Function

A coaching app for a personal trainer and their clients (built for up to ~100 clients):
the coach programs workouts, clients see them on their phone, log their results, and chat with the coach.

- **Coach:** client roster with real compliance (7/30/90 days) and due dates, weekly workout calendar
  (add, edit, copy/paste, drag to move, mark completed/missed), exercise library, nutrition & habits,
  assessments, messages.
- **Client:** today's workout, log weight × reps per exercise (with *last time* and *personal record*),
  finish workout, habits, messages. Installable on the phone's home screen and opens offline.
- **Live:** workout edits and messages appear on the other device without refreshing.

## Two modes

| | Demo mode | Cloud mode |
|---|---|---|
| When | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` **not** set | both set |
| Data | sample clients, stored only in this browser | real accounts, stored in Supabase, synced across devices |
| Sign-in | any name/password (demo only) | email + password, roles enforced by the database |

## Set up cloud mode (about 15 minutes, free tier is enough)

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Create the database:** in *SQL Editor*, run [`supabase/schema.sql`](supabase/schema.sql), then
   [`supabase/auth.sql`](supabase/auth.sql).
3. **Auth settings** (*Authentication → Sign In / Providers → Email*): keep **Confirm email ON**.
   In *Authentication → URL Configuration*, set **Site URL** to the app's address
   (e.g. `https://audiovido.github.io/Pure-Function/`) so confirmation links open the app.
4. **Connect the app:** copy *Project URL* and the *anon / publishable key* from *Project Settings → API*.
   - Hosted on GitHub Pages: add them as repository **variables** (*Settings → Secrets and variables →
     Actions → Variables*) named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then push to `main`.
   - Locally: put the same two lines in `.env.local`.

   The anon key is meant to be public; access is protected by Row Level Security in the database.
5. **The coach signs up first.** The very first account becomes the coach (trainer).
6. **Add clients with their real email address** (*Add client*). When a client signs up with that same
   email, their account is linked automatically and they only ever see their own data.
   Anyone else who signs up gets no access.

### Optional: daily workout reminder emails

Sends each client an email in the morning listing today's workout (skipped if they have no workout,
already finished it, are archived, or the coach turned *Email daily workout* off in their profile). Uses [Resend](https://resend.com) (free tier).

```bash
supabase functions deploy daily-reminders --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="Coach <coach@yourdomain.com>" \
  APP_URL=https://audiovido.github.io/Pure-Function/ COACH_TIMEZONE=America/New_York \
  CRON_SECRET=$(openssl rand -hex 16)
```

Then run [`supabase/reminders-cron.sql`](supabase/reminders-cron.sql) (fill in the project ref and the
same `CRON_SECRET`). Call the function with `?dry=1` to see who would be emailed without sending.

## Development

```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:3000
npm run lint       # type check
npm test           # unit tests (vitest)
npm run build
```

Browser tests of the whole cloud flow (sign-up, linking, sync, realtime, permissions) run against an
in-memory Supabase fake — see [`e2e/README.md`](e2e/README.md).

CI runs type check, unit tests and build on every branch and pull request; pushes to `main` deploy to
GitHub Pages.

## Known limitations

- One workout per day per client.
- If the coach and the client change **the same day's workout at the same moment**, the last save wins.
- The bundled exercise library links to third-party demo videos; replace them with your own before
  using the app commercially.
- Payments, Referrals, Teams and Marketing are demo screens only (hidden for real accounts).
