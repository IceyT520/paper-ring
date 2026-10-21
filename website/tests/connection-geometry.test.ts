import test from 'node:test';
import assert from 'node:assert/strict';
import {createCourtyard,visitRoom,personPoint,floorFold} from '../src/connection-geometry';

test('each person chooses independently; the shared place survives both returning home',()=>{
 let state=createCourtyard();
 state=visitRoom(state,'blue');
 assert.deepEqual(state,{blue:true,red:false,openedBlue:true,openedRed:false,established:false});
 state=visitRoom(state,'red');assert.equal(state.established,true);
 state=visitRoom(state,'blue');
 assert.equal(state.blue,false);assert.equal(state.red,true);assert.equal(state.established,true);
 state=visitRoom(state,'red');
 assert.equal(state.blue,false);assert.equal(state.red,false);assert.equal(state.established,true);
 assert.equal(state.openedBlue,true);assert.equal(state.openedRed,true);
 assert.equal(createCourtyard().established,false);
});

test('walking to the courtyard uses the actual doorway, never the other private room',()=>{
 for(const side of ['blue','red'] as const){
  const sign=side==='blue'?-1:1;
  assert.equal(personPoint(side,0).u,sign*320);assert.equal(personPoint(side,1).u,sign*90);
  const gate=personPoint(side,.5);assert.equal(gate.u,sign*200);
  assert(gate.v>36&&gate.v<116);assert(gate.z<92);
  for(let i=0;i<=100;i++){
   const p=personPoint(side,i/100);
   assert(p.u*sign>=90&&p.u*sign<=320);assert(p.v>36&&p.v<116);
  }
 }
});

test('unfolding adds a common floor without consuming either private room',()=>{
 for(const side of ['blue','red'] as const)for(let n=0;n<=20;n++){
  const facets=floorFold(side,n/20);
  for(const facet of facets)for(const p of facet){assert(p.u>=-200&&p.u<=200);assert(p.z>=0)}
  const hinge=facets[0][0];assert.equal(hinge.u,side==='blue'?-200:200);assert.equal(hinge.z,0);
  if(n===20){assert(Math.abs(facets.at(-1)![1].u)<1e-8);assert(facets.flat().every((p:{z:number})=>p.z===0))}
 }
});
