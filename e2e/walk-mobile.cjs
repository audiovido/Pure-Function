// Screenshot walkthrough of the coach app at phone size. Usage: node walk-mobile.cjs <dist> <outdir> [label]
const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.cjs'); const root=process.argv[2]; const out=process.argv[3];
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4195);
(async()=>{
 const mock=createMock(); const {db}=mock;
 db.users.push({id:'trainer-0000',email:'coach@example.com',password:'pw-coach-1'});
 db.profiles.push({id:'trainer-0000',role:'trainer',display_name:'Coach'});
 const t=new Date(); const iso=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
 for (const [id,name] of [['ryan','Ryan Sterling'],['ana','Ana Lopez']]) db.clients.push({id,data:{id,name,email:id+'@x.com',membershipStatus:'Active',goal:'',coach:'Coach',currentProgram:'',assessments:[],homework:[]}});
 db.workouts.push({client_id:'ryan',date:iso,data:{date:iso,dayOfWeek:'X',dayNumber:1,fullDayName:'X',focus:'Lower body',exercises:[{id:'e1',name:'Back Squat',sets:3,setsText:'3',reps:'8/8',intensity:'135 lb',rest:'',notes:'',orderLabel:'A'},{id:'e2',name:'Romanian Deadlift',sets:3,reps:'10',intensity:'',rest:'',notes:'',orderLabel:'B'}]}});
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await ctx.route('https://mock.supabase.co/**',mock.handler); await ctx.routeWebSocket('wss://mock.supabase.co/**',mock.wsHandler);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(['warning','error'].includes(m.type()) && !/WebSocket|fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.type()+': '+m.text().slice(0,200)); });
 let n=0; const shot=async(name)=>{ await p.screenshot({path:`${out}/${String(++n).padStart(2,'0')}-${name}.png`}); const hw=await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1); console.log('shot',n,name, hw?'(HORIZONTAL OVERFLOW)':''); };
 await p.goto('http://localhost:4195/'); await p.waitForTimeout(2200);
 await p.locator('input[aria-label="Email"]').fill('coach@example.com'); await p.locator('input[aria-label="Password"]').fill('pw-coach-1');
 await p.locator('form button[type=submit]').click(); await p.waitForTimeout(3000);
 await shot('landing');
 const tabs = await p.locator('nav button:visible, footer button:visible').evaluateAll(els=>els.map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim()));
 console.log('BOTTOM/NAV:', JSON.stringify(tabs));
 const tryClick=async(sel,name)=>{ const l=p.locator(sel).first(); if(await l.count()){ await l.click().catch(e=>console.log('click fail',name,e.message.slice(0,80))); await p.waitForTimeout(1200); await shot(name);} else console.log('missing',name); };
 const nav=(label)=>`nav[aria-label="Coach navigation"] >> text=${label}`;
 await tryClick(nav('Clients'),'clients-tab');
 await tryClick('text=Ryan Sterling >> visible=true','open-client');
 await p.mouse.wheel(0,600); await p.waitForTimeout(400); await shot('client-scrolled');
 await tryClick('button[title^="Add or edit workout"] >> visible=true','open-builder');
 await p.keyboard.press('Escape').catch(()=>{}); const cancel=p.getByRole('button',{name:'Cancel'}); if(await cancel.count()) { await cancel.first().click(); await p.waitForTimeout(400); }
 await tryClick('button:has-text("Goals") >> visible=true','client-goals-tab');
 await tryClick('button:has-text("Messages") >> visible=true','client-messages-tab');
 const inp=p.locator('form input[type=text] >> visible=true').last();
 if (await inp.count()) { await inp.fill('Great job today!'); await inp.press('Enter'); await p.waitForTimeout(2500); await shot('client-message-sent'); }
 console.log('MESSAGES IN DB:', JSON.stringify(db.messages.map(m=>[m.client_id,m.data.text,m.created_at])));
 console.log('CLIENT DATA KEYS:', JSON.stringify(Object.keys(db.clients[0].data)));
 await tryClick('button[aria-label="Back to clients"]','back-to-roster');
 await tryClick(nav('Library'),'library');
 await tryClick(nav('Programs'),'programs');
 await tryClick(nav('Messages'),'messages');
 await tryClick(nav('Account'),'account');
 console.log('errors:',errs);
 await b.close(); srv.close();
})().catch(e=>{console.error('CRASH',e.message);process.exit(1);});
