export type Vector3Tuple=[number,number,number];
const TAU=Math.PI*2;
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
