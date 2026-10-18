import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paperShape,paperPoint,paperTrace} from '../src/paper-geometry.ts';
test('tracers stay on the existing strip throughout opening, twist and closure',()=>{
 for(const progress of [0,.08,.2,.52,.78,.8,.82,.95,.999,1])for(const channel of [0,1])for(let i=0;i<100;i++){
  const p=paperTrace(i/100,channel,progress),shape=paperShape(progress);
  assert(p.u>=shape.gap/2-1e-12&&p.u<=Math.PI*2-shape.gap/2+1e-12);
  assert.deepEqual(p.point,paperPoint(p.u,p.v,shape.twist));
  const distance=p.center.reduce((sum,x,j)=>sum+(x-p.point[j])*p.normal[j]*p.side,0);
  assert(Math.abs(distance-.075)<1e-12,'sphere center stays beyond its .055 radius');
 }
});
test('a closed Mobius tracer crosses both seams continuously and returns after two laps',()=>{
 const distance=(a:number[],b:number[])=>Math.hypot(...a.map((x,i)=>x-b[i]));
 for(const boundary of [.5,1]){
  const a=paperTrace(boundary-1e-7,0,1),b=paperTrace(boundary+1e-7,0,1);
  assert(distance(a.center,b.center)<1e-5,'no jump at a side-changing seam');
 }
 const start=paperTrace(0,0,1),half=paperTrace(.5,0,1),end=paperTrace(1,0,1);
 assert.notEqual(start.side,half.side);assert.deepEqual(start.center,end.center);
});
test('a touch can start at any paper width and either face without a seam jump',()=>{
 for(const u of [.1,1.9,5.8])for(const v of [-.7,-.3,0,.4,.7])for(const back of [false,true]){
  const phase=(u/(Math.PI*2)+(back?1:0))/2,offset=back?-v:v;
  const touched=paperTrace(phase,0,1,offset);
  const expected=paperPoint(u,v,1);
  assert(Math.hypot(...touched.point.map((n,i)=>n-expected[i]))<1e-12);
  assert.equal(touched.side,back?-1:1);
  const a=paperTrace(.5-1e-7,0,1,offset),b=paperTrace(.5+1e-7,0,1,offset);
  assert(Math.hypot(...a.center.map((n,i)=>n-b.center[i]))<1e-5);
 }
});
