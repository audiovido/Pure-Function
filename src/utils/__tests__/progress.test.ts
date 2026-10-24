import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { getCompliance, parseWeight, parseReps, buildExerciseHistory, getExerciseSummary } from '../progress';
describe('progress utils', () => {
  it('behaves as specified', () => {
const ex = (id:string,name:string,o:any={}) => ({id,name,sets:3,reps:'8',intensity:'',rest:'',notes:'',...o});
const day = (date:string, exercises:any[], o:any={}) => ({date,dayOfWeek:'',dayNumber:1,fullDayName:'',focus:null,exercises,...o});
// compliance
const w = [
  day('2026-10-20',[ex('a','Squat',{completed:true})]),
  day('2026-10-21',[ex('b','Squat')]),                       // missed
  day('2026-10-22',[ex('c','Squat')],{sessionCompleted:true}),
  day('2026-10-23',[]),                                       // rest
  day('2026-10-24',[ex('d','Squat')]),                        // today, not done -> ignored
  day('2026-10-25',[ex('e','Squat')]),                        // future -> ignored
  day('2026-09-01',[ex('f','Squat')]),                        // outside 7d, inside 90d
];
assert.equal(getCompliance(w,'2026-10-24',7), 67);
assert.equal(getCompliance(w,'2026-10-24',90), 50);
assert.equal(getCompliance([day('2026-10-24',[])],'2026-10-24',7), null);
// parsing
assert.deepEqual(parseWeight('135 lb'),{value:135,unit:'lb'});
assert.deepEqual(parseWeight('60kg'),{value:60,unit:'kg'});
assert.deepEqual(parseWeight('72.5'),{value:72.5,unit:'lb'});
assert.equal(parseWeight('BW'),null);
assert.equal(parseReps('8, 8, 7'),8);
assert.equal(parseReps(''),null);
// history / PR
const h = buildExerciseHistory([
  day('2026-10-10',[ex('1','Back Squat',{actualWeight:'135 lb',actualReps:'8'})]),
  day('2026-10-17',[ex('2','back squat ',{actualWeight:'145 lb',actualReps:'6'})]),
  day('2026-10-24',[ex('3','Back Squat',{actualWeight:'155 lb',actualReps:'5'})]),
]);
const s = getExerciseSummary(h,'Back Squat','2026-10-24');
assert.equal(s.last?.weightText,'145 lb');
assert.equal(s.pr?.weightText,'155 lb');
assert.equal(s.isNewPr,true);
const s2 = getExerciseSummary(h,'Back Squat','2026-10-17');
assert.equal(s2.isNewPr,true);            // 145x6 > 135x8
assert.equal(getExerciseSummary(h,'Deadlift','2026-10-24').pr,undefined);


  });
});

import { formatPrescription } from '../progress';
describe('formatPrescription', () => {
  it('shows exactly what the coach typed, TrueCoach style', () => {
    assert.equal(formatPrescription({ sets: 2, setsText: '2-3', reps: '5-10' }), '2-3 sets 5-10 reps');
    assert.equal(formatPrescription({ sets: 3, reps: '8/8', intensity: '135 lb' }), '3 sets 8/8 reps · 135 lb');
    assert.equal(formatPrescription({ setsText: '', reps: '' }), '');
  });
});
