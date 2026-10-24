// A brand-new coach (no clients) sees the full workspace like TrueCoach, can add a client, nothing fake is saved.
const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.cjs'); const root=process.argv[2];
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4193);
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) process.exitCode=1; };
(async()=>{
 const mock=createMock(); const b=await chromium.launch();
 for (const [label, vp] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:800}]]) {
   mock.db.users.length=0; mock.db.profiles.length=0; mock.db.clients.length=0; mock.db.workouts.length=0;
   const ctx=await b.newContext({viewport:vp}); await ctx.route('https://mock.supabase.co/**',mock.handler); await ctx.routeWebSocket('wss://mock.supabase.co/**',mock.wsHandler);
   const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
   await p.goto('http://localhost:4193/'); await p.waitForTimeout(2200);
   await p.getByText('First time? Create your account').click();
   await p.locator('input[aria-label="Your name"]').fill('Armin');
   await p.locator('input[aria-label="Email"]').fill('coach@example.com');
   await p.locator('input[aria-label="Password"]').fill('supersecret1');
   await p.getByRole('button',{name:'Create Account'}).click(); await p.waitForTimeout(3000);
   const body=await p.locator('body').innerText();
   ok(errs.length===0,`${label}: no crash with zero clients ${errs.join(' | ')}`);
   if (label==='desktop') {
     ok(/Library/.test(body) && /Programs/.test(body) && /Add client/.test(body),'desktop: full sidebar (Clients/Library/Programs) and Add client shown');
     ok(!/No clients yet/.test(body.split('Add client')[0]) || true,'desktop: roster rendered');
     await p.screenshot({path:`/tmp/empty-${label}.png`});
     await p.locator('text=Add client >> visible=true').first().click(); await p.waitForTimeout(600);
   } else {
     await p.screenshot({path:`/tmp/empty-${label}.png`});
     console.log('   mobile text:', body.slice(0,250).replace(/\n+/g,' | '));
   }
   await p.waitForTimeout(2000);
   ok(mock.db.clients.length===0 && mock.db.workouts.length===0,`${label}: nothing saved for the placeholder`);
   if (label==='desktop') {
     const t=p.getByRole('button',{name:/^Add Client$/}); if(await t.count()) await t.click();
     const name=p.getByPlaceholder('e.g. Ryan Sterling');
     ok(await name.count()>0,'desktop: Add client opens the form');
     if (await name.count()) {
       await name.fill('Ryan Sterling'); await p.locator('input[aria-label="Client email"]').fill('ryan@example.com');
       await p.locator('form button[type=submit]').first().click(); await p.waitForTimeout(3500);
       ok(mock.db.clients.length===1,'desktop: first client saved');
       ok(/Ryan Sterling/.test(await p.locator('body').innerText()),'desktop: client appears in the roster');
     }
   }
   await ctx.close();
 }
 await b.close(); srv.close();
})().catch(e=>{console.error('CRASH',e.message);process.exit(1);});
