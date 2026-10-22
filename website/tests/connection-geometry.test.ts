import test from 'node:test';
import assert from 'node:assert/strict';
import * as geometry from '../src/connection-geometry';

test('the roof closes the exposed gap without moving or shrinking either private space',()=>{
 assert.equal(typeof geometry.shelterGeometry,'function','the scene needs two paper wings and an actual shelter');
 const first=geometry.shelterGeometry(0),last=geometry.shelterGeometry(1);
 assert(first.gap>300,'rain can initially fall into the middle');
 assert.equal(last.gap,0,'the final roof has no open seam');
 for(let i=0;i<=100;i++){
  const g=geometry.shelterGeometry(i/100);
  assert.deepEqual(g.privateSpaces,first.privateSpaces,'both private spaces stay intact');
  assert(g.left.tip.x<=550&&g.right.tip.x>=550,'the two paper wings must never cross');
  assert.equal(g.left.tip.x+g.right.tip.x,1100,'the shared shelter remains centered');
  assert.equal(g.left.tip.y,g.right.tip.y,'the paper edges meet at the same height');
  assert(!/NaN|Infinity/.test(g.rainClip));
 }
});

test('rain is stopped at the actual paper surface; only an open gap lets it reach the floor',()=>{
 assert.equal(typeof geometry.roofAt,'function','rain needs geometric occlusion, not a decorative fade');
 assert.equal(geometry.roofAt(550,0),null);
 assert.equal(geometry.roofAt(550,1),95);
 assert.equal(geometry.roofAt(100,1),null,'rain remains outside the shelter');
 for(const p of [0,.25,.5,.75,1]){
  const g=geometry.shelterGeometry(p);
  for(const wing of [g.left,g.right]){
   assert.equal(geometry.roofAt(wing.tip.x,p),wing.tip.y);
   const mid=(wing.outer.x+wing.tip.x)/2;
   const surface=geometry.roofAt(mid,p);assert.notEqual(surface,null);
   assert(Math.abs(surface!-(wing.outer.y+wing.tip.y)/2)<1e-8);
  }
 }
});
