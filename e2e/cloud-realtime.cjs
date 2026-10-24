// Live updates: changes made on another device appear without reloading, with no upload echo loops,
// and each user only receives rows they are allowed to see.
const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const createMock=require('./mock-supabase.cjs'); const root=process.argv[2];
const srv=http.createServer((q,r)=>{ let f=path.join(root,q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(4192);
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) process.exitCode=1; };
const t=new Date(); const today=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
(async()=>{
 const mock=createMock(); const {db}=mock;
 // seed: trainer, two clients
 db.users.push({id:'trainer-0000',email:'coach@x.com',password:'pw-coach-1'},{id:'ryan-00000',email:'ryan@x.com',password:'pw-ryan-11'},{id:'zed-000000',email:'zed@x.com',password:'pw-zed-111'});
 db.profiles.push({id:'trainer-0000',role:'trainer',display_name:'Coach'},{id:'ryan-00000',role:'client',display_name:'Ryan',client_id:'ryan'},{id:'zed-000000',role:'client',display_name:'Zed',client_id:'zed'});
 const mkClient=(id,name,email)=>({id,data:{id,name,email,membershipStatus:'Active',goal:'',coach:'Coach',currentProgram:'',assessments:[],homework:[]}});
 db.clients.push(mkClient('ryan','Ryan','ryan@x.com'),mkClient('zed','Zed','zed@x.com'));
 const day=(exs)=>({date:today,dayOfWeek:'X',dayNumber:1,fullDayName:'X',focus:'Lower',exercises:exs});
 const ex=(id,name)=>({id,name,sets:3,reps:'8',intensity:'',rest:'',notes:''});
 db.workouts.push({client_id:'ryan',date:today,data:day([ex('e1','Back Squat')])});

 const b=await chromium.launch();
 const login=async(email,pw)=>{ const ctx=await b.newContext({viewport:{width:390,height:800}}); await ctx.route('https://mock.supabase.co/**',mock.handler); await ctx.routeWebSocket('wss://mock.supabase.co/**',mock.wsHandler);
   const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
   await p.goto('http://localhost:4192/'); await p.waitForTimeout(2200);
   await p.locator('input[aria-label="Email"]').fill(email); await p.locator('input[aria-label="Password"]').fill(pw);
   await p.locator('form button[type=submit]').click(); await p.waitForTimeout(3000); return {p,errs}; };

 const R=await login('ryan@x.com','pw-ryan-11');
 const Z=await login('zed@x.com','pw-zed-111');
 const T=await login('coach@x.com','pw-coach-1');
 ok(await R.p.getByText('Back Squat').count()>0,'client sees initial workout');

 // trainer edits the workout on another device
 const posts=()=>mock.log.filter(l=>l.startsWith('POST /rest/v1/workouts')).length;
 const before=posts();
 const row=db.workouts.find(w=>w.client_id==='ryan');
 row.data=day([ex('e1','Back Squat'),ex('e2','Plank Hold')]);
 mock.broadcast('workouts','UPDATE',row);
 await R.p.waitForTimeout(1500);
 ok(await R.p.getByText('Plank Hold').count()>0,'workout edit appears live on client (no reload)');
 await R.p.waitForTimeout(3000);
 ok(posts()===before,'no echo upload after receiving a live change (posts before='+before+', after='+posts()+')');

 // new message from trainer
 const msg={id:'m-live-1',client_id:'ryan',data:{id:'m-live-1',clientId:'ryan',senderRole:'trainer',senderName:'Coach',text:'Great session today!',timestamp:new Date().toISOString()},created_at:new Date().toISOString()};
 db.messages.push(msg); mock.broadcast('messages','INSERT',msg);
 await R.p.waitForTimeout(800);
 await R.p.getByRole('button',{name:/Messages/}).last().click(); await R.p.waitForTimeout(800);
 ok(await R.p.getByText('Great session today!').count()>0,'message appears live on client');

 // isolation: Zed never receives Ryan's rows
 ok(!mock.realtimeLog.some(l=>l.endsWith('zed-0000')),'other client receives none of Ryan\'s rows');
 ok(mock.realtimeLog.some(l=>l.endsWith('trainer-')),'trainer receives client rows');

 // client logs a result -> trainer device gets it live
 await R.p.getByRole('button',{name:/Today/}).last().click(); await R.p.waitForTimeout(600);
 const n=mock.realtimeLog.length;
 await R.p.getByRole('button',{name:'Log result'}).first().click();
 await R.p.getByPlaceholder(/135/).fill('100'); await R.p.getByPlaceholder('8, 8, 7').fill('5');
 await R.p.getByRole('button',{name:'Save'}).click(); await R.p.waitForTimeout(3500);
 ok(mock.realtimeLog.slice(n).some(l=>l.startsWith('UPDATE workouts') && l.endsWith('trainer-')),'client result is pushed live to the trainer');
 const saved=db.workouts.find(w=>w.client_id==='ryan').data;
 ok(saved.exercises.some(e=>e.name==='Plank Hold') && saved.exercises[0].actualWeight==='100 lb','client save kept the trainer\'s live edit (no overwrite)');

 console.log('   errors:',[...R.errs,...Z.errs,...T.errs]);
 await b.close(); srv.close();
})().catch(e=>{console.error('CRASH',e.message);process.exit(1);});
