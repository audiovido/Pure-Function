const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.cjs'); const root=process.argv[2];
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4191);
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
(async()=>{
 const mock=createMock(); const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:800}}); await ctx.route('https://mock.supabase.co/**',mock.handler); await ctx.routeWebSocket('wss://mock.supabase.co/**',mock.wsHandler); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 // 1. email-confirmation mode
 process.env.MOCK_CONFIRM_EMAIL='1';
 await p.goto('http://localhost:4191/'); await p.waitForTimeout(2200);
 await p.getByText('First time? Create your account').click();
 await p.locator('input[aria-label="Email"]').fill('c@example.com'); await p.locator('input[aria-label="Password"]').fill('password123');
 await p.getByRole('button',{name:'Create Account'}).click(); await p.waitForTimeout(1500);
 ok(await p.getByText(/confirmation link/).count()===1,'confirmation-required signup shows "check your email"');
 ok(await p.getByRole('button',{name:'Sign In'}).count()>=1,'returns to sign-in form');
 // 2. wrong password
 await p.locator('input[aria-label="Email"]').fill('c@example.com'); await p.locator('input[aria-label="Password"]').fill('wrongpass');
 await p.locator('form button[type=submit]').click(); await p.waitForTimeout(1200);
 ok(await p.getByText(/Invalid login credentials/i).count()===1,'wrong password shows error');
 // 3. correct login, add + delete client
 await p.locator('input[aria-label="Password"]').fill('password123');
 await p.locator('form button[type=submit]').click(); await p.waitForTimeout(2500);
 ok(await p.getByText('You have no clients yet').count()===1,'login works, empty state');
 await p.getByRole('button',{name:/Add your first client/}).click(); await p.waitForTimeout(400);
 const t=p.getByRole('button',{name:/^Add Client$/}); if(await t.count()) await t.click();
 await p.getByPlaceholder('e.g. Ryan Sterling').fill('Dana Lee'); await p.locator('input[aria-label="Client email"]').fill('dana@example.com');
 await p.locator('form button[type=submit]').first().click(); await p.waitForTimeout(3500);
 ok(mock.db.clients.length===1,'client uploaded');
 mock.db.workouts.push({client_id:mock.db.clients[0].id,date:'2026-10-24',data:{date:'2026-10-24',exercises:[]}});
 // delete via manager modal (UI)
 console.log('   errors:',errs);
 await b.close(); srv.close();
})().catch(e=>{console.error('CRASH',e.message);process.exit(1);});
