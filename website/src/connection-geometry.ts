export type Point={x:number;y:number};
export type Room=Point&{radius:number;height:number};
export type ConnectionLayout={
 width:number;height:number;left:Room;right:Room;
 gateLeft:Point;gateRight:Point;controlLeft:Point;controlRight:Point;angle:number;
};
export function connectionLayout(space:number,narrow:boolean):ConnectionLayout{
 const t=Math.max(0,Math.min(1,space));
 const left:Room=narrow?{x:170-35*t,y:210-60*t,radius:128,height:61}:{x:290-75*t,y:250-14*t,radius:175,height:72};
 const right:Room=narrow?{x:450,y:500,radius:128,height:61}:{x:810,y:250,radius:175,height:72};
 const angle=Math.atan2((right.y-left.y)/.46,right.x-left.x);
 const at=(room:Room,a:number)=>({x:room.x+Math.cos(a)*room.radius,y:room.y+Math.sin(a)*room.radius*.46});
 const gateLeft=at(left,angle),gateRight=at(right,angle+Math.PI);
 const dx=gateRight.x-gateLeft.x,dy=gateRight.y-gateLeft.y,len=Math.hypot(dx,dy);
 const bow=narrow?48:100,normal={x:-dy/len*bow,y:dx/len*bow};
 return{width:narrow?620:1100,height:narrow?700:540,left,right,gateLeft,gateRight,angle,
  controlLeft:{x:gateLeft.x+dx*.28+normal.x,y:gateLeft.y+dy*.28+normal.y},
  controlRight:{x:gateRight.x-dx*.28+normal.x,y:gateRight.y-dy*.28+normal.y}};
}
export function bridgePoint(layout:ConnectionLayout,t:number):Point{
 if(t<=0)return layout.gateLeft;
 if(t>=1)return layout.gateRight;
 const s=1-t,{gateLeft:a,controlLeft:b,controlRight:c,gateRight:d}=layout;
 return{x:s*s*s*a.x+3*s*s*t*b.x+3*s*t*t*c.x+t*t*t*d.x,y:s*s*s*a.y+3*s*s*t*b.y+3*s*t*t*c.y+t*t*t*d.y};
}
const f=(n:number)=>n.toFixed(2);
const p=(v:Point)=>`${f(v.x)},${f(v.y)}`;
export function connectionPath(layout:ConnectionLayout){
 return`M${p(layout.left)} L${p(layout.gateLeft)} C${p(layout.controlLeft)} ${p(layout.controlRight)} ${p(layout.gateRight)} L${p(layout.right)}`;
}
/** The light takes the same route as the visible bridge, including the two
 *  sections inside the paper rooms. No floating, disconnected endpoints. */
export function connectionPoint(layout:ConnectionLayout,t:number):Point{
 const mix=(a:Point,b:Point,q:number)=>({x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q});
 if(t<.24)return mix(layout.left,layout.gateLeft,Math.max(0,t)/.24);
 if(t>.76)return mix(layout.gateRight,layout.right,Math.min(1,(t-.76)/.24));
 return bridgePoint(layout,(t-.24)/.52);
}
export function roomFacets(room:Room,doorAngle:number){
 const gap=.34,count=40;
 const floor=(angle:number)=>({x:room.x+Math.cos(angle)*room.radius,y:room.y+Math.sin(angle)*room.radius*.46});
 return Array.from({length:count},(_,i)=>{
  const a=doorAngle+gap+(Math.PI*2-gap*2)*i/count,b=doorAngle+gap+(Math.PI*2-gap*2)*(i+1)/count;
  const v=floor(a),w=floor(b),topV={x:v.x,y:v.y-room.height},topW={x:w.x,y:w.y-room.height};
  const arc=`${room.radius} ${f(room.radius*.46)} 0 0`;
  return{body:`M${p(v)} A${arc} 1 ${p(w)} L${p(topW)} A${arc} 0 ${p(topV)} Z`,
   rim:`M${p(topV)} A${arc} 1 ${p(topW)}`,
   light:.37+.52*(.5+.5*Math.cos((a+b)/2+1))};
 });
}
