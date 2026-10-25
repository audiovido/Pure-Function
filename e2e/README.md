# Cloud end-to-end tests

These drive the real app in a browser against an in-memory fake of Supabase (REST, auth and the Realtime websocket)
(`mock-supabase.cjs`, which mirrors the DB trigger and access rules), so the whole cloud
flow can be tested without a Supabase project.

```bash
npm i --no-save playwright && npx playwright install chromium   # once
VITE_FREEZE_LOGIN=false VITE_SUPABASE_URL=https://mock.supabase.co VITE_SUPABASE_ANON_KEY=anon \
  npx vite build --outDir /tmp/dist-cloud
cd e2e && for t in cloud-flow cloud-auth cloud-realtime cloud-empty-coach; do node $t.cjs /tmp/dist-cloud; done
```

Every line should print `PASS`. Not run in CI (needs a browser download).

Screenshot walkthroughs (no assertions; they print console errors and horizontal overflow):

```bash
node walk-coach.cjs /tmp/dist-cloud /tmp/shots    # desktop: coach builds a workout, client sees it
node walk-mobile.cjs /tmp/dist-cloud /tmp/shots   # phone: every coach tab
```

Phone layout audit (overlapping/spilling/cut-off text, content wider than the screen, and form
fields under 16px that make iOS zoom). Every screen should report 0 issues at every width:

```bash
for w in 320 360 375 390 414 430; do node layout-audit.cjs /tmp/dist-cloud /tmp/shots $w; done
```
