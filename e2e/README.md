# Cloud end-to-end tests

These drive the real app in a browser against an in-memory fake of Supabase
(`mock-supabase.js`, which mirrors the DB trigger and access rules), so the whole cloud
flow can be tested without a Supabase project.

```bash
npm i --no-save playwright && npx playwright install chromium   # once
VITE_SUPABASE_URL=https://mock.supabase.co VITE_SUPABASE_ANON_KEY=anon \
  npx vite build --outDir /tmp/dist-cloud
cd e2e && node cloud-flow.js /tmp/dist-cloud && node cloud-auth.js /tmp/dist-cloud
```

Every line should print `PASS`. Not run in CI (needs a browser download).
