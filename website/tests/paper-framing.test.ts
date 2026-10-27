import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as paper from '../src/paper-geometry.ts';
import {finaleScore} from '../src/finale-score.ts';
import {Vector3,Euler,PerspectiveCamera} from 'three';

test('the entire paper stays inside its frame through every cinematic pose and viewport ratio',()=>{
 const fit=(paper as unknown as {fitPaperScale?:Function}).fitPaperScale;
 assert.equal(typeof fit,'function','paper needs a geometry-based fit, not a portrait multiplier');
 for(const aspect of [.55,.8,1,1.7,2.8])for(let t=0;t<=22;t+=.2){
  const shot=finaleScore(t),shape=paper.paperShape(shot.twist),points:number[]=[];
  for(let i=0;i<=144;i++)for(const v of [-.71,.71])points.push(...paper.paperPoint(shape.gap/2+i/144*(Math.PI*2-shape.gap),v,shape.twist));
  const rotation={x:shot.pitch,y:shot.yaw,z:shot.roll},scale=fit!(points,rotation,aspect,shot.scale,.2);
  const camera=new PerspectiveCamera(34,aspect,.1,100);camera.position.z=11.8;camera.updateMatrixWorld();
  for(let i=0;i<points.length;i+=3){
   const projected=new Vector3(points[i],points[i+1],points[i+2]).applyEuler(new Euler(rotation.x,rotation.y,rotation.z)).multiplyScalar(scale);
   projected.y+=.2;projected.project(camera);
   assert(Math.abs(projected.x)<=.88001&&Math.abs(projected.y)<=.88001,`clipping at aspect ${aspect}, time ${t}`);
  }
 }
});
