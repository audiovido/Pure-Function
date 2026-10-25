# Cloud end-to-end tests

These drive the real app in a browser against an in-memory fake of Supabase (REST, auth and the Realtime websocket)
(`mock-supabase.cjs`, which mirrors the DB trigger and access rules), so the whole cloud
flow can be tested without a Supabase project.

```bash
npm i --no-save playwright && npx playwright install chromium   # once
VITE_SUPABASE_URL=https://mock.supabase.co VITE_SUPABASE_ANON_KEY=anon \
  npx vite build --outDir /tmp/dist-cloud
cd e2e && for t in cloud-flow cloud-auth cloud-realtime; do node $t.cjs /tmp/dist-cloud; done
```

Every line should print `PASS`. Not run in CI (needs a browser download).
