export type Vector3Tuple=[number,number,number];
const TAU=Math.PI*2;
/** Bound every rotated vertex in the perspective frustum, leaving 12% air.
 *  A fixed portrait multiplier cannot contain the opening close-up. */
export function fitPaperScale(points:ArrayLike<number>,rotation:{x:number;y:number;z:number},aspect:number,desired:number,offsetY=0){
 const a=Math.cos(rotation.x),b=Math.sin(rotation.x),c=Math.cos(rotation.y),d=Math.sin(rotation.y),e=Math.cos(rotation.z),f=Math.sin(rotation.z);
 const vertical=Math.tan(34*Math.PI/360)*.88,horizontal=vertical*Math.max(.01,aspect);
 let scale=desired;
 for(let i=0;i<points.length;i+=3){
  const x=points[i],y=points[i+1],z=points[i+2];
  const rx=c*e*x-c*f*y+d*z,ry=(a*f+b*e*d)*x+(a*e-b*f*d)*y-b*c*z,rz=(b*f-a*e*d)*x+(b*e+a*f*d)*y+a*c*z;
  for(const sign of [-1,1]){
   const dx=sign*rx+horizontal*rz,dy=sign*ry+vertical*rz;
   if(dx>0)scale=Math.min(scale,horizontal*11.8/dx);
   if(dy>0)scale=Math.min(scale,(vertical*11.8-sign*offsetY)/dy);
  }
 }
 return Math.max(.01,scale);
}
export function paperShape(progress:number){
 const t=Math.max(0,Math.min(1,progress));
 const q=Math.max(0,Math.min(1,(t-.18)/.64));
 return{twist:q*q*(3-2*q),gap:t<.2?t/.2*.48:t<.8?.48:(1-t)/.2*.48,closed:t===1};
}
export function paperPoint(u:number,v:number,twist:number):Vector3Tuple{
 const phi=Math.PI/2*(1-twist)+twist*u/2,r=2.24+v*Math.cos(phi);
 return[r*Math.cos(u),r*Math.sin(u),v*Math.sin(phi)];
}
export function paperNormal(u:number,v:number,twist:number):Vector3Tuple{
 const phi=Math.PI/2*(1-twist)+twist*u/2,c=Math.cos(phi),s=Math.sin(phi),cu=Math.cos(u),su=Math.sin(u),r=2.24+v*c;
 const du=[-r*su-v*s*twist/2*cu,r*cu-v*s*twist/2*su,v*c*twist/2],dv=[c*cu,c*su,s];
 const n:Vector3Tuple=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]],length=Math.hypot(...n);
 return n.map(x=>x/length) as Vector3Tuple;
}
/** Sample the represented strip, never an extrapolation beyond its open seam. */
export function paperTrace(phase:number,channel:number,progress:number,offset=.28){
 const shape=paperShape(progress),p=((phase+channel*.5)%1+1)%1;
 const lap=shape.closed?Math.floor(p*2):channel;
 const along=shape.closed?(p*2)%1:p;
 const u=shape.gap/2+along*(TAU-shape.gap),v=lap===0?offset:-offset,side=lap===0?1:-1;
 const point=paperPoint(u,v,shape.twist),normal=paperNormal(u,v,shape.twist);
 const center=point.map((x,i)=>x+normal[i]*side*.075) as Vector3Tuple;
 return{u,v,side,point,normal,center};
}
