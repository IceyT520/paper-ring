import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PARAMETERS as P,criticalDistance,regime,linearAt,rk4,simulate,boundedEquilibrium} from '../src/model.ts';
test('critical threshold and both sides follow the actual equation',()=>{
 assert.equal(criticalDistance(P),9);
 assert.equal(regime({...P,D:9}),'critical');assert.equal(regime({...P,D:3}),'growth');assert.equal(regime({...P,D:12}),'decay');
 assert(linearAt(12,P).A>1,'Linear result must not be clamped');
 const decay=linearAt(200,{...P,D:12});assert(decay.A<1e-10&&decay.R<1e-10);
});
test('at the critical value every point on the equilibrium line remains fixed',()=>{
 for(const A of [.1,.5,1,2]){const p=linearAt(100,{...P,D:9},{A,R:3*A});assert(Math.abs(p.A-A)<1e-12);assert(Math.abs(p.R-3*A)<1e-12)}
 const point=linearAt(100,{...P,D:9});assert(point.A>0);assert(Math.abs(point.R-3*point.A)<1e-12);
});
test('analytical linear solution agrees with independent RK4 integration',()=>{
 for(const D of [.6,3,9,12]){const p={...P,D};let A=.65,R=.15;for(let i=0;i<10000;i++)[A,R]=rk4(A,R,.0001,p,'linear');const exact=linearAt(1,p);assert(Math.abs(A-exact.A)<1e-9);assert(Math.abs(R-exact.R)<1e-9)}
});
test('bounded extension preserves bounds and reaches its independently computed equilibrium',()=>{
 for(const p of [P,{...P,D:.2},{...P,D:12},{alpha:8,beta:.2,gamma:8,delta:.2,D:.2},{alpha:.2,beta:6,gamma:.2,delta:6,D:12}]){
  const {samples}=simulate(p,'bounded',80);assert(samples.every(s=>s.A>=0&&s.A<=1&&s.R>=0&&s.R<=1));
  const expected=boundedEquilibrium(p),last=samples.at(-1)!;assert(Math.abs(last.A-expected.A)<1e-5);assert(Math.abs(last.R-expected.R)<1e-5);
 }
});
test('recomputations use the same initial state, and divergence is reported instead of flattened',()=>{
 assert.deepEqual(simulate(P,'linear'),simulate(P,'linear'));
 const run=simulate({alpha:8,beta:.2,gamma:8,delta:.2,D:.2},'linear');
 assert(run.truncated);assert(Math.max(run.samples.at(-1)!.A,run.samples.at(-1)!.R)>10000);
 assert.deepEqual(run.samples[0],{t:0,A:.65,R:.15});
});
test('rejects a zero distance or invalid parameter instead of producing misleading curves',()=>{
 assert.throws(()=>linearAt(1,{...P,D:0}),RangeError);assert.throws(()=>simulate({...P,alpha:NaN},'bounded'),RangeError);
});
