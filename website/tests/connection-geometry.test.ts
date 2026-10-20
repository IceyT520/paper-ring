import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionLayout,bridgePoint,connectionPoint} from '../src/connection-geometry';

test('the bridge passes through both openings without cutting through either private space',()=>{
 for(const narrow of [false,true]){
  for(let step=0;step<=20;step++){
   const layout=connectionLayout(step/20,narrow);
   const {left,right,gateLeft,gateRight}=layout;
   for(const [room,gate] of [[left,gateLeft],[right,gateRight]] as const){
    const q=((gate.x-room.x)/room.radius)**2+((gate.y-room.y)/(room.radius*.46))**2;
    assert(Math.abs(q-1)<1e-10,'each bridge end meets the actual paper boundary');
   }
   assert.deepEqual(bridgePoint(layout,0),gateLeft);
   assert.deepEqual(bridgePoint(layout,1),gateRight);
   assert.deepEqual(connectionPoint(layout,0),{x:left.x,y:left.y});
   assert.deepEqual(connectionPoint(layout,1),{x:right.x,y:right.y});
   for(let i=1;i<100;i++){
    const point=bridgePoint(layout,i/100);
    for(const room of [left,right]){
     const q=((point.x-room.x)/room.radius)**2+((point.y-room.y)/(room.radius*.46))**2;
     assert(q>=1-1e-8,'the outside bridge must stay outside both rooms');
    }
   }
   for(const room of [left,right]){
    assert(room.x-room.radius>=0&&room.x+room.radius<=layout.width);
    assert(room.y-room.radius*.46-room.height>0);
   }
  }
 }
});

test('taking space moves only the blue room; the red room does not pursue',()=>{
 for(const narrow of [false,true]){
  const together=connectionLayout(0,narrow),apart=connectionLayout(1,narrow);
  assert.deepEqual(together.right,apart.right);
  assert(Math.hypot(apart.left.x-apart.right.x,apart.left.y-apart.right.y)>Math.hypot(together.left.x-together.right.x,together.left.y-together.right.y));
  assert.equal(together.left.radius,apart.left.radius,'taking space must not shrink the person');
 }
});
