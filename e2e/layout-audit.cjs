// Phone layout audit: visits every coach and client screen at phone widths and reports
// overlapping text, text spilling out of its box, and content wider than the screen.
// Usage: node layout-audit.cjs <dist> <outdir> [width]
const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.cjs'); const root=process.argv[2]; const out=process.argv[3]; const W=+(process.argv[4]||375);
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'}[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4196);

function audit() {
  const vis = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 0 && r.height > 0; };
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  const scrollsX = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return a; } return null; };
  const inModalOrMenu = (el) => !!el.closest('[role=dialog], .fixed, .absolute');
  const label = (el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
  const issues = [];
  const leaves = [...document.querySelectorAll('body *')].filter((el) => ownText(el) && vis(el));
  for (const el of leaves) {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    // text spilling out of its own box (not intentionally truncated)
    if (el.scrollWidth > el.clientWidth + 2 && s.overflowX === 'visible' && s.textOverflow !== 'ellipsis' && el.clientWidth > 0)
      issues.push(`SPILL "${label(el)}" (${el.scrollWidth}>${el.clientWidth}px)`);
    // wider than the screen and not inside a horizontal scroller/clipper
    if ((r.right > innerWidth + 1 || r.left < -1) && !scrollsX(el))
      issues.push(`OFFSCREEN "${label(el)}" (${Math.round(r.left)}..${Math.round(r.right)})`);
  }
  // cut off by a box that hides overflow (not a scroller): e.g. a button pushed past the card edge
  // the nearest box that cuts content horizontally; only explicit sideways scrollers
  // (tab strips, wide tables with overflow-x-auto) are allowed to have content past their edge
  const clipper = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX;
    if (o === 'visible') continue;
    if ((o === 'auto' || o === 'scroll') && /overflow-x-(auto|scroll)|overflow-auto/.test(a.className)) return null;
    return a; } return null; };
  for (const el of [...leaves, ...document.querySelectorAll('button, input, select, a')].filter(vis)) {
    const c = clipper(el); if (!c) continue; const r = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
    if (r.right > cr.right + 2 && r.left < cr.right) issues.push(`CLIPPED "${label(el) || el.getAttribute('placeholder') || el.tagName}" (${Math.round(r.right - cr.right)}px cut)`);
  }
  // iOS zooms into focused fields smaller than 16px
  for (const el of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select, textarea')) {
    if (vis(el) && parseFloat(getComputedStyle(el).fontSize) < 16) issues.push(`ZOOM field "${el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.name || el.type}" ${getComputedStyle(el).fontSize}`);
  }
  // overlapping text boxes (ignore ancestors/descendants and layered popovers)
  // the part of an element actually visible: clipped by every overflow-clipping ancestor and the viewport
  const visibleRect = (el) => {
    const r = el.getBoundingClientRect(); let L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') { const c = a.getBoundingClientRect();
        L = Math.max(L, c.left); T = Math.max(T, c.top); R = Math.min(R, c.right); B = Math.min(B, c.bottom); }
    }
    L = Math.max(L, 0); T = Math.max(T, 0); R = Math.min(R, innerWidth); B = Math.min(B, innerHeight);
    return { left: L, top: T, right: R, bottom: B };
  };
  const rects = leaves.filter((el) => !inModalOrMenu(el) || document.querySelector('[role=dialog]'))
    .map((el) => ({ el, r: visibleRect(el) })).filter((x) => x.r.right - x.r.left > 1 && x.r.bottom - x.r.top > 1);
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (ox > 3 && oy > 3) {
      // clipped by a scroll container? only count if both are actually visible at that point
      const cx = Math.max(a.r.left, b.r.left) + ox / 2, cy = Math.max(a.r.top, b.r.top) + oy / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
      const top = document.elementFromPoint(cx, cy);
      if (top && (a.el.contains(top) || top.contains(a.el)) && (b.el.contains(top) || top.contains(b.el))) continue;
      issues.push(`OVERLAP "${label(a.el)}" x "${label(b.el)}"`);
    }
  }
  return [...new Set(issues)];
}

(async () => {
  const mock = createMock(); const { db } = mock;
  const t = new Date(); const iso = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  db.users.push({ id: 'trainer-0000', email: 'coach@example.com', password: 'pw-coach-1' }, { id: 'ryan-00000', email: 'ryan@x.com', password: 'pw-ryan-11' });
  db.profiles.push({ id: 'trainer-0000', role: 'trainer', display_name: 'Coach Sam' }, { id: 'ryan-00000', role: 'client', display_name: 'Ryan', client_id: 'ryan' });
  for (const [id, name] of [['ryan', 'Ryan Sterling-Montgomery'], ['ana', 'Ana Lopez']]) db.clients.push({ id, data: { id, name, email: id + '@x.com', membershipStatus: 'Active', goal: 'Get stronger', coach: 'Coach Sam', currentProgram: '', assessments: [], homework: [], compliance7d: 67, compliance30d: 50, compliance90d: 40 } });
  db.workouts.push({ client_id: 'ryan', date: iso, data: { date: iso, dayOfWeek: 'X', dayNumber: 1, fullDayName: 'X', focus: 'Lower body strength', exercises: [
    { id: 'e1', name: 'Barbell Back Squat with Pause at the Bottom', sets: 3, setsText: '3-4', reps: '8/8 per side', intensity: '135 lb', rest: '', notes: 'Keep chest up, slow eccentric', orderLabel: 'A1' },
    { id: 'e2', name: 'Romanian Deadlift', sets: 3, reps: '10', intensity: '', rest: '', notes: '', orderLabel: 'A2' }] } });
  db.messages.push({ id: 'm1', client_id: 'ryan', data: { id: 'm1', clientId: 'ryan', senderRole: 'trainer', senderName: 'Coach Sam', text: 'Great session today! Keep the tempo slow on squats.', timestamp: '9:15 AM' }, created_at: new Date().toISOString() });

  const b = await chromium.launch(); const report = {};
  const page = async () => { const ctx = await b.newContext({ viewport: { width: W, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route('https://mock.supabase.co/**', mock.handler); await ctx.routeWebSocket('wss://mock.supabase.co/**', mock.wsHandler); return ctx.newPage(); };
  const check = async (p, name) => { await p.waitForTimeout(500); const r = await p.evaluate(audit); report[name] = r;
    await p.screenshot({ path: `${out}/${name}.png` }); console.log(`${r.length ? 'ISSUES' : 'ok    '} ${name}${r.length ? '\n   - ' + r.join('\n   - ') : ''}`); };
  const click = async (p, sel) => { const l = p.locator(sel).first(); if (await l.count()) { await l.click().catch(() => {}); await p.waitForTimeout(700); return true; } console.log('   (missing ' + sel + ')'); return false; };
  const login = async (p, email, pw) => { await p.goto('http://localhost:4196/'); await p.waitForTimeout(2200);
    await p.locator('input[aria-label="Email"]').fill(email); await p.locator('input[aria-label="Password"]').fill(pw); await p.locator('form button[type=submit]').click(); await p.waitForTimeout(3000); };

  // ---- sign-in screens
  let p = await page(); await p.goto('http://localhost:4196/'); await p.waitForTimeout(2200); await check(p, 'login');
  await click(p, 'text=First time? Create your account'); await check(p, 'signup');

  // ---- coach
  p = await page(); await login(p, 'coach@example.com', 'pw-coach-1');
  const nav = (l) => `nav[aria-label="Coach navigation"] >> text=${l}`;
  await check(p, 'coach-clients');
  await click(p, 'text=Ryan Sterling-Montgomery >> visible=true'); await check(p, 'coach-client-workouts');
  const tabs = await p.locator('.md\\:hidden .overflow-x-auto button').allInnerTexts();
  for (const tab of tabs.slice(1)) { await click(p, `.md\\:hidden .overflow-x-auto button:has-text("${tab}")`); await check(p, 'coach-client-tab-' + tab.replace(/\W+/g, '-')); }
  await click(p, `.md\\:hidden .overflow-x-auto button:has-text("${tabs[0]}")`);
  if (await click(p, 'button[title^="Add or edit workout"] >> visible=true')) { await check(p, 'coach-workout-builder'); await click(p, 'button:has-text("Cancel")'); }
  await click(p, 'button[aria-label="Back to clients"]');
  await click(p, nav('Library'));
  for (const sub of ['Exercises', 'Warmups', 'Cooldowns', 'Metric Sets', 'Documents']) { await click(p, `button:has-text("${sub}") >> visible=true`); await check(p, 'coach-library-' + sub.replace(/\W+/g, '-')); }
  await click(p, nav('Programs')); await check(p, 'coach-programs');
  await click(p, nav('Messages')); await check(p, 'coach-messages');
  await click(p, 'text=Ryan Sterling-Montgomery >> visible=true'); await check(p, 'coach-chat');
  await click(p, nav('Account')); await check(p, 'coach-account');

  // ---- client
  p = await page(); await login(p, 'ryan@x.com', 'pw-ryan-11');
  await check(p, 'client-today');
  if (await click(p, 'button:has-text("Log result") >> visible=true')) await check(p, 'client-log-form');
  const cnav = (l) => `nav[aria-label="Client bottom navigation"] >> text=${l}`;
  for (const tab of ['Workouts', 'Habits', 'Messages', 'Account']) { await click(p, cnav(tab)); await check(p, 'client-' + tab.toLowerCase()); }

  const total = Object.values(report).reduce((n, r) => n + r.length, 0);
  console.log(`\nSCREENS ${Object.keys(report).length}, ISSUES ${total} at ${W}px`);
  await b.close(); srv.close();
})().catch((e) => { console.error('CRASH', e.message); process.exit(1); });
