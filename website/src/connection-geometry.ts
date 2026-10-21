export type Side='blue'|'red';
export type World={u:number;v:number;z:number};
export type Courtyard={blue:boolean;red:boolean;openedBlue:boolean;openedRed:boolean;established:boolean};
export const createCourtyard=():Courtyard=>({blue:false,red:false,openedBlue:false,openedRed:false,established:false});
export function visitRoom(previous:Courtyard,side:Side):Courtyard{
 const state={...previous,[side]:!previous[side]};
 if(state.blue)state.openedBlue=true;
 if(state.red)state.openedRed=true;
 state.established=state.openedBlue&&state.openedRed;
 return state;
}
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p)};
export function project({u,v,z}:World,narrow:boolean){
 return narrow?{x:320+u*.54+v*.45,y:465+u*.52-v*.42-z}:{x:515+u+v*.35,y:375-v*.5-z};
}
export function polygon(points:World[],narrow:boolean){
 return points.map((p,i)=>{const q=project(p,narrow);return `${i?'L':'M'}${q.x.toFixed(2)},${q.y.toFixed(2)}`}).join(' ')+'Z';
}
export function personPoint(side:Side,t:number):World{
 const sign=side==='blue'?-1:1,p=clamp(t);
 const a={u:sign*320,v:60,z:15},b={u:sign*200,v:76,z:15},c={u:sign*90,v:92,z:32};
 const [from,to,q]=p<.5?[a,b,p*2]:[b,c,(p-.5)*2];
 return{u:from.u+(to.u-from.u)*q,v:from.v+(to.v-from.v)*q,z:from.z+(to.z-from.z)*q};
}
/** The two concertina leaves have fixed hinges. Opening creates extra space;
 * neither private floor moves, shrinks, or gets absorbed by the courtyard. */
export function floorFold(side:Side,progress:number):World[][]{
 const sign=side==='blue'?-1:1,p=clamp(progress),width=200*(.06+.94*p);
 const point=(i:number,v:number)=>({u:sign*(200-width*i/4),v,z:i%2?42*(1-p):0});
 return Array.from({length:4},(_,i)=>[point(i,0),point(i+1,0),point(i+1,180),point(i,180)]);
}
export function doorPanel(side:Side,progress:number):World[]{
 const sign=side==='blue'?-1:1,angle=clamp(progress)*Math.PI*.47;
 const hinge={u:sign*200,v:116,z:0};
 const free={u:hinge.u+sign*80*Math.sin(angle),v:116-80*Math.cos(angle),z:0};
 return[hinge,free,{...free,z:92},{...hinge,z:92}];
}
