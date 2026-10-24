import marks from '../content/paper-marks.json';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
type Point={x:number;y:number};
/** Two fixed outer eaves unfold to one ridge. Private floor areas never move. */
export function shelterGeometry(progress:number){
 const p=clamp(progress),x=350+200*p,y=190-95*p;
 const left={outer:{x:130,y:260},tip:{x,y}},right={outer:{x:970,y:260},tip:{x:1100-x,y}};
 // The vertical gap is real. Rain and the paper use the same vertices.
 const rainClip=`M0 0H1100V570H970V260L${right.tip.x} ${y}V570H${x}V${y}L130 260V570H0Z`;
 return{left,right,gap:right.tip.x-x,rainClip,privateSpaces:[{x:275,y:480,rx:140,ry:48},{x:825,y:480,rx:140,ry:48}]};
}
export function roofAt(x:number,progress:number):number|null{
 const p=clamp(progress),tipX=350+200*p,tipY=190-95*p;
 const localX=x>550?1100-x:x;
 if(localX>=130&&localX<=tipX)return 260+(tipY-260)*(localX-130)/(tipX-130);
 return null;
}
export function wingPaths(outer:Point,tip:Point){
 const direction=outer.x<550?1:-1,heel={x:outer.x+95*direction,y:outer.y+51};
 const surface=(u:number,v:number)=>{
  const top={x:outer.x+(tip.x-outer.x)*u,y:outer.y+(tip.y-outer.y)*u};
  const bottom={x:heel.x+(tip.x-heel.x)*u,y:heel.y+(tip.y+52-heel.y)*u};
  return `${top.x+(bottom.x-top.x)*v} ${top.y+(bottom.y-top.y)*v}`;
 };
 return{
  face:`M${outer.x} ${outer.y}L${tip.x} ${tip.y}L${tip.x} ${tip.y+52}L${heel.x} ${heel.y}Z`,
  fold:`M${outer.x} ${outer.y}L${tip.x} ${tip.y+52}L${heel.x} ${heel.y}Z`,
  edge:`M${outer.x} ${outer.y}L${tip.x} ${tip.y}L${tip.x} ${tip.y+52}L${heel.x} ${heel.y}Z`,
  crease:`M${outer.x} ${outer.y}L${tip.x} ${tip.y+52}`,
  grain:[.22,.5,.78].map(t=>`M${outer.x+(tip.x-outer.x)*t} ${outer.y+(tip.y-outer.y)*t}L${heel.x+(tip.x-heel.x)*t} ${heel.y+(tip.y+52-heel.y)*t}`).join(''),
  memory:marks.folds.map(([x,y,u,v])=>`M${surface(x,y)}L${surface(u,v)}`).join(''),
 };
}
