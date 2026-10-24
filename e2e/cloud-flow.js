const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.js');
const root=process.argv[2];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html';
 fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4190);
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
(async()=>{
 const mock=createMock(); const b=await chromium.launch();
 const mk=async()=>{ const ctx=await b.newContext({viewport:{width:390,height:800}}); await ctx.route('https://mock.supabase.co/**',mock.handler); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/fonts|net::ERR|Failed to load resource/.test(m.text())) errs.push('console: '+m.text()); }); return {ctx,p,errs}; };

 // ---- Trainer signs up
 const T=await mk(); const p=T.p;
 await p.goto('http://localhost:4190/'); await p.waitForTimeout(2200);
 ok(await p.locator('input[aria-label="Email"]').count()===1,'cloud login form shown');
 await p.getByText('First time? Create your account').click();
 await p.locator('input[aria-label="Your name"]').fill('Coach Sam');
 await p.locator('input[aria-label="Email"]').fill('coach@example.com');
 await p.locator('input[aria-label="Password"]').fill('supersecret1');
 await p.getByRole('button',{name:'Create Account'}).click();
 await p.waitForTimeout(2500);
 ok(await p.getByText('You have no clients yet').count()===1,'new trainer sees empty state');
 ok(mock.db.profiles.length===1 && mock.db.profiles[0].role==='trainer','first signup became trainer');
 await p.waitForTimeout(2500);
 ok(mock.db.clients.length===0 && mock.db.workouts.length===0,'NO demo data uploaded to cloud');

 // ---- Add first client
 await p.getByRole('button',{name:/Add your first client/}).click();
 await p.waitForTimeout(500);
 const addToggle=p.getByRole('button',{name:/^Add Client$/}); if(await addToggle.count()) await addToggle.click();
 await p.getByPlaceholder('e.g. Ryan Sterling').fill('Ryan Sterling');
 await p.locator('input[aria-label="Client email"]').fill('Ryan@Example.com');
 await p.locator('form button[type=submit]').first().click();
 await p.waitForTimeout(3500);
 ok(mock.db.clients.length===1,'client saved to cloud');
 const row=mock.db.clients[0];
 ok(row && row.data.email==='ryan@example.com','client email normalized for linking');
 ok(row && !('password' in row.data),'no password stored in cloud');
 ok(row && row.data.coach==='Coach Sam' && row.data.assessments.length===0,'no fake coach/assessments');
 console.log('   trainer errors:',T.errs);

 // ---- Reload: session restore + pull
 await p.reload(); await p.waitForTimeout(3500);
 const body=await p.locator('body').innerText();
 ok(!/Create your account|Sign In/.test(body.slice(0,200)) && /Ryan/.test(body),'session restored, client list pulled after reload');

 // ---- Client signs up with that email
 const C=await mk(); const q=C.p;
 await q.goto('http://localhost:4190/'); await q.waitForTimeout(2200);
 await q.getByText('First time? Create your account').click();
 await q.locator('input[aria-label="Your name"]').fill('Ryan');
 await q.locator('input[aria-label="Email"]').fill('ryan@example.com');
 await q.locator('input[aria-label="Password"]').fill('anothersecret1');
 await q.getByRole('button',{name:'Create Account'}).click(); await q.waitForTimeout(2500);
 const cp=mock.db.profiles.find(x=>x.role==='client');
 ok(cp && cp.client_id===row.id,'client profile auto-linked by email');
 ok(await q.getByText('Rest Day').count()>0 || /Today/.test(await q.locator('body').innerText()),'client sees client view');

 // ---- Stranger cannot get in
 const S=await mk(); const s=S.p;
 await s.goto('http://localhost:4190/'); await s.waitForTimeout(2200);
 await s.getByText('First time? Create your account').click();
 await s.locator('input[aria-label="Email"]').fill('stranger@example.com');
 await s.locator('input[aria-label="Password"]').fill('strangerpass1');
 await s.getByRole('button',{name:'Create Account'}).click(); await s.waitForTimeout(2200);
 ok(await s.getByText(/isn't linked to a coach/).count()===1,'stranger gets "not linked" message and no access');

 // ---- Trainer programs a workout (via direct DB write simulating trainer save), client logs result
 const today=new Date(); const iso=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 mock.db.workouts.push({client_id:row.id,date:iso,data:{date:iso,dayOfWeek:'X',dayNumber:1,fullDayName:'X',focus:'Lower',exercises:[{id:'e1',name:'Back Squat',sets:3,reps:'8',intensity:'',rest:'',notes:''}]}});
 await q.reload(); await q.waitForTimeout(3500);
 ok(await q.getByText('Back Squat').count()>0,'client sees workout programmed by trainer');
 await q.getByRole('button',{name:'Log result'}).first().click();
 await q.getByPlaceholder(/135/).fill('100'); await q.getByPlaceholder('8, 8, 7').fill('8, 8, 8');
 await q.getByRole('button',{name:'Save'}).click(); await q.waitForTimeout(3500);
 const w=mock.db.workouts.find(x=>x.client_id===row.id&&x.date===iso);
 ok(w && w.data.exercises[0].actualWeight==='100 lb' && w.data.exercises[0].actualReps==='8, 8, 8','client result synced to cloud');
 console.log('   client errors:',C.errs,' stranger errors:',S.errs);

 // ---- Trainer deletes client
 console.log('   requests sample:',mock.log.slice(-4));
 await b.close(); srv.close();
})().catch(e=>{console.error('TEST CRASH',e.message);process.exit(1);});
