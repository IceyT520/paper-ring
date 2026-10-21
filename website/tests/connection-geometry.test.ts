import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionLayout,intersectionPath} from '../src/connection-geometry';

test('approaching creates a third space while both personal spaces keep their full size',()=>{
 for(const narrow of [false,true]){
  const initial=connectionLayout(0,narrow),end=connectionLayout(1,narrow);
  assert(initial.right-initial.left>2*initial.radius,'two separate spaces before the gesture');
  assert(end.sharedWidth>0,'a common region exists after the gesture');
  for(let i=0;i<=50;i++){
   const state=connectionLayout(i/50,narrow);
   assert.equal(state.radius,initial.radius,'closeness cannot shrink the original spaces');
   assert(state.right-state.left>state.radius,'a visible private region remains on either side');
   assert.equal(state.left+state.right,state.width,'the pair stays centered');
   assert(state.left-state.radius>=0&&state.right+state.radius<=state.width);
   assert(state.y-state.radius>=0&&state.y+state.radius<=state.height);
  }
 }
});

test('the shared lens follows the actual intersection, never a decorative third circle',()=>{
 assert.equal(intersectionPath(0,300,100,100),'');
 assert.equal(intersectionPath(0,200,100,100),'');
 const lens=intersectionPath(0,120,100,100);
 // The two intersections are (60,20) and (60,180): 60²+80²=100².
 assert.match(lens,/M60(?:\.0+)?[ ,]20(?:\.0+)?/);
 assert.match(lens,/[ ,]60(?:\.0+)?[ ,]180(?:\.0+)?/);
 assert(!/NaN|Infinity/.test(lens));
});
