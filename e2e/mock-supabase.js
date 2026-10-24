// Minimal in-memory Supabase (auth + PostgREST) for Playwright route mocking.
// Mirrors the DB trigger rules: first signup = trainer; later signups = client iff a clients row has that email.
const crypto = require('crypto');
module.exports = function createMock() {
  const db = { users: [], profiles: [], clients: [], workouts: [], nutrition: [], messages: [] };
  const log = [];
  const keys = { clients: ['id'], workouts: ['client_id','date'], nutrition: ['client_id','date'], messages: ['id'], profiles: ['id'] };
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
  const json = (route, status, body, extra={}) => route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json', ...extra }, body: JSON.stringify(body) });
  const sessionFor = (u) => ({ access_token: 'tok-' + u.id, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600, refresh_token: 'ref-' + u.id,
    user: { id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, user_metadata: u.meta || {}, app_metadata: {}, created_at: new Date().toISOString() } });
  const uidFromAuth = (req) => { const a = req.headers()['authorization'] || ''; const m = a.match(/tok-(.+)$/); return m && m[1]; };

  function createProfile(u) {
    if (!db.profiles.some(p => p.role === 'trainer')) {
      db.profiles.push({ id: u.id, role: 'trainer', display_name: (u.meta && u.meta.display_name) || u.email.split('@')[0], client_id: null });
    } else {
      const c = db.clients.find(c => (c.data.email || '').toLowerCase() === u.email.toLowerCase());
      if (c) db.profiles.push({ id: u.id, role: 'client', display_name: c.data.name, client_id: c.id });
    }
  }

  async function handler(route) {
    const req = route.request(); const url = new URL(req.url()); const path = url.pathname; const method = req.method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    log.push(method + ' ' + path + url.search.slice(0, 80));

    if (path === '/auth/v1/signup') {
      const b = JSON.parse(req.postData() || '{}');
      if (db.users.some(u => u.email === b.email)) return json(route, 422, { msg: 'User already registered' });
      const u = { id: crypto.randomUUID(), email: b.email, password: b.password, meta: b.data };
      db.users.push(u); createProfile(u);
      if (process.env.MOCK_CONFIRM_EMAIL) return json(route, 200, { id: u.id, email: u.email, aud: 'authenticated' });
      return json(route, 200, sessionFor(u));
    }
    if (path === '/auth/v1/token') {
      const b = JSON.parse(req.postData() || '{}');
      if (url.searchParams.get('grant_type') === 'password') {
        const u = db.users.find(u => u.email === b.email && u.password === b.password);
        if (!u) return json(route, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
        return json(route, 200, sessionFor(u));
      }
      return json(route, 400, { error: 'unsupported' });
    }
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors });
    if (path === '/auth/v1/user') { const id = uidFromAuth(req); const u = db.users.find(u => u.id === id); return u ? json(route, 200, sessionFor(u).user) : json(route, 401, {}); }

    const m = path.match(/^\/rest\/v1\/(\w+)$/);
    if (m) {
      const table = m[1]; const rows = db[table]; if (!rows) return json(route, 404, { message: 'no table' });
      const uid = uidFromAuth(req); const prof = db.profiles.find(p => p.id === uid);
      if (!uid) return json(route, 401, { message: 'JWT required' });
      const isTrainer = prof && prof.role === 'trainer';
      const own = (r) => isTrainer || (prof && (table === 'profiles' ? r.id === uid : table === 'clients' ? r.id === prof.client_id : r.client_id === prof.client_id));
      const filter = (r) => { for (const [k, v] of url.searchParams) { const mm = v.match(/^eq\.(.*)$/); if (mm && !['select','order','on_conflict'].includes(k) && String(r[k]) !== mm[1]) return false; } return true; };
      if (method === 'GET') {
        const out = rows.filter(r => own(r) && filter(r));
        if ((req.headers()['accept'] || '').includes('vnd.pgrst.object')) return out.length ? json(route, 200, out[0]) : json(route, 406, { code: 'PGRST116', details: 'The result contains 0 rows', message: 'Cannot coerce' });
        return json(route, 200, out);
      }
      if (method === 'POST') {
        const body = JSON.parse(req.postData() || '[]'); const arr = Array.isArray(body) ? body : [body];
        for (const r of arr) {
          if (!own(r) && !(isTrainer)) return json(route, 403, { message: 'RLS violation' });
          const ks = keys[table]; const i = rows.findIndex(x => ks.every(k => x[k] === r[k]));
          if (i >= 0) rows[i] = { ...rows[i], ...r }; else rows.push(r);
        }
        return route.fulfill({ status: 201, headers: cors, body: '' });
      }
      if (method === 'DELETE') {
        if (!isTrainer) return json(route, 403, { message: 'RLS' });
        for (let i = rows.length - 1; i >= 0; i--) if (filter(rows[i])) rows.splice(i, 1);
        return route.fulfill({ status: 204, headers: cors });
      }
    }
    return json(route, 404, { message: 'unmocked ' + path });
  }
  return { db, log, handler };
};
