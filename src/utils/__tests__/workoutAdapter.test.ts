import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { cardsFromDays, daysFromCards } from '../workoutAdapter';
describe('workout adapter', () => {
  it('behaves as specified', () => {
const ex = (id:string,name:string,o:any={}) => ({id,name,sets:3,reps:'8',intensity:'24 kg',rest:'60s',notes:'tempo',...o});
const day = (date:string, exercises:any[], o:any={}) => ({date,dayOfWeek:'X',dayNumber:1,fullDayName:'X',focus:exercises.length?'Lower':null,exercises,...o});
const TODAY='2026-10-24';
const days = [
  day('2026-10-20',[ex('a','Goblet Squat',{videoUrl:'https://y/1',actualWeight:'135 lb',actualReps:'8',completed:true, cues:['brace']}), ex('b','Row',{completed:true})],{sessionCompleted:true,sessionRpe:8}),
  day('2026-10-21',[ex('c','Deadlift')]),
  day('2026-10-22',[]),                                   // empty placeholder
  day('2026-10-26',[ex('d','Press')]),
];
// 1. lossless round trip
const back = daysFromCards(cardsFromDays(days,TODAY), days);
assert.deepEqual(back.find(d=>d.date==='2026-10-20')!.exercises[0].videoUrl,'https://y/1');
assert.equal(back.find(d=>d.date==='2026-10-20')!.exercises[0].actualWeight,'135 lb');
assert.deepEqual(back.find(d=>d.date==='2026-10-20')!.exercises[0].cues,['brace']);
assert.equal(back.find(d=>d.date==='2026-10-20')!.sessionRpe,8);
assert.equal(back.find(d=>d.date==='2026-10-20')!.sessionCompleted,true);
assert.equal(back.find(d=>d.date==='2026-10-22')!.exercises.length,0);
assert.equal(back.length,days.length);
// 2. statuses
const cards = cardsFromDays(days,TODAY);
assert.equal(cards.length,3);                           // empty rest day has no card
assert.equal(cards[0].status,'completed');
assert.equal(cards[1].status,'missed');                 // past, not done
assert.equal(cards[2].status,'scheduled');              // future
// 3. edit: change reps + add new exercise + new day
let c = cardsFromDays(days,TODAY);
c[1].exercises[0].reps='5';
c[1].exercises.push({id:'n1',orderLabel:'B',name:'Back Squat',note:'',sets:'2-3',reps:'5-10',weight:'____',status:'scheduled'});
c.push({id:'x',dateIso:'2026-10-28',title:'Workout',status:'scheduled',exercises:[{id:'n2',orderLabel:'A',name:'Plank',note:'',sets:'3',reps:'30s',weight:'____',status:'scheduled'}]});
const edited = daysFromCards(c,days);
const d21 = edited.find(d=>d.date==='2026-10-21')!;
assert.equal(d21.exercises[0].reps,'5'); assert.equal(d21.exercises.length,2);
assert.equal(d21.exercises[1].sets,2); assert.equal(d21.exercises[1].setsText,'2-3'); assert.equal(d21.exercises[1].intensity,'');
assert.equal(edited.find(d=>d.date==='2026-10-28')!.fullDayName.includes('2026'),true);
assert.deepEqual(edited.map(d=>d.date),[...edited.map(d=>d.date)].sort());
// 4. delete a workout
c = cardsFromDays(days,TODAY).filter(x=>x.dateIso!=='2026-10-21');
const del = daysFromCards(c,days).find(d=>d.date==='2026-10-21')!;
assert.equal(del.exercises.length,0); assert.equal(del.focus,null);
// 5. trainer marks exercise completed -> status & session
c = cardsFromDays(days,TODAY); c[1].exercises[0].status='completed';
const comp = daysFromCards(c,days).find(d=>d.date==='2026-10-21')!;
assert.equal(comp.exercises[0].completed,true); assert.equal(comp.sessionCompleted,true);
// 6. two cards same date merge
c = cardsFromDays(days,TODAY); c.push({id:'dup',dateIso:'2026-10-26',title:'Workout',status:'scheduled',exercises:[{id:'z',orderLabel:'B',name:'Row',note:'',sets:'3',reps:'8',weight:'____',status:'scheduled'}]});
assert.equal(daysFromCards(c,days).find(d=>d.date==='2026-10-26')!.exercises.length,2);


  });
});
