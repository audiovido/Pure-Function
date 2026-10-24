// Exploratory walkthrough: coach opens a client's workout calendar, adds/edits a workout. Saves screenshots.
const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.cjs'); const root=process.argv[2]; const out=process.argv[3];
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4194);
(async()=>{
 const mock=createMock(); const {db}=mock;
 db.users.push({id:'trainer-0000',email:'coach@example.com',password:'pw-coach-1'});
 db.profiles.push({id:'trainer-0000',role:'trainer',display_name:'Coach'});
 db.clients.push({id:'ryan',data:{id:'ryan',name:'Ryan Sterling',email:'ryan@x.com',membershipStatus:'Active',goal:'',coach:'Coach',currentProgram:'',assessments:[],homework:[]}});
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
 await ctx.route('https://mock.supabase.co/**',mock.handler); await ctx.routeWebSocket('wss://mock.supabase.co/**',mock.wsHandler);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 let n=0; const shot=async(name)=>{ await p.screenshot({path:`${out}/${String(++n).padStart(2,'0')}-${name}.png`}); console.log('shot',n,name); };
 await p.goto('http://localhost:4194/'); await p.waitForTimeout(2200);
 await p.locator('input[aria-label="Email"]').fill('coach@example.com'); await p.locator('input[aria-label="Password"]').fill('pw-coach-1');
 await p.locator('form button[type=submit]').click(); await p.waitForTimeout(3000);
 await shot('roster');
 await p.locator('text=Ryan Sterling >> visible=true').first().click(); await p.waitForTimeout(1500);
 await shot('client-calendar');
 await p.getByTitle('Add or edit workout on SAT 24').click(); await p.waitForTimeout(800);
 await shot('add-workout-open');
 const inputs = await p.locator('input:visible, textarea:visible, select:visible').evaluateAll(els=>els.map(e=>[e.tagName,e.getAttribute('placeholder')||'',e.getAttribute('aria-label')||'',e.value].join('|')));
 console.log('INPUTS:', JSON.stringify(inputs).slice(0,1500));
 const mb = await p.locator('[role=dialog] button:visible, .fixed button:visible').evaluateAll(els=>els.map(e=>(e.getAttribute('title')||e.innerText||'').trim()).filter(Boolean));
 console.log('MODAL BUTTONS:', JSON.stringify([...new Set(mb)]).slice(0,1500));
 // fill the blank exercise row like a coach would
 const vis=()=>p.locator('.fixed input:visible');
 console.log('BLANK ROW VALUES:', JSON.stringify(await vis().evaluateAll(els=>els.map(e=>e.value))));
 await p.getByPlaceholder('Exercise name (search 380+ library exercises)...').first().fill('Back Squat'); await p.waitForTimeout(300);
 await p.keyboard.press('Escape').catch(()=>{});
 const all=await vis().count();
 await vis().nth(all-3).fill('3'); await vis().nth(all-2).fill('8/8'); await vis().nth(all-1).fill('135 lb');
 await shot('filled');
 await p.getByRole('button',{name:'Save Workout'}).click().catch(e=>console.log('save failed', e.message)); await p.waitForTimeout(1500);
 await shot('after-save');
 await p.waitForTimeout(2500);
 const w=db.workouts.find(x=>x.client_id==='ryan');
 console.log('SAVED ROW:', JSON.stringify(w&&w.data).slice(0,600));
 // client view on phone
 db.users.push({id:'ryan-00000',email:'ryan@x.com',password:'pw-ryan-11'}); db.profiles.push({id:'ryan-00000',role:'client',display_name:'Ryan',client_id:'ryan'});
 const c2=await b.newContext({viewport:{width:390,height:844}}); await c2.route('https://mock.supabase.co/**',mock.handler); await c2.routeWebSocket('wss://mock.supabase.co/**',mock.wsHandler);
 const q=await c2.newPage(); q.on('pageerror',e=>errs.push('client: '+e.message));
 await q.goto('http://localhost:4194/'); await q.waitForTimeout(2200);
 await q.locator('input[aria-label="Email"]').fill('ryan@x.com'); await q.locator('input[aria-label="Password"]').fill('pw-ryan-11');
 await q.locator('form button[type=submit]').click(); await q.waitForTimeout(3000);
 await q.screenshot({path:`${out}/${String(++n).padStart(2,'0')}-client-today.png`}); console.log('shot client-today');
 // click the exercise to see detail
 console.log('CLIENT TEXT:', (await q.locator('body').innerText()).slice(0,200).replace(/\n+/g,' | '));
 await q.locator('text=Back Squat >> visible=true').first().click().catch(e=>console.log('click ex failed',e.message)); await q.waitForTimeout(1200);
 await q.screenshot({path:`${out}/${String(++n).padStart(2,'0')}-client-exercise-click.png`}); console.log('shot client-exercise-click');
 console.log('errors:',errs);
 await b.close(); srv.close();
})().catch(e=>{console.error('CRASH',e.message);process.exit(1);});
