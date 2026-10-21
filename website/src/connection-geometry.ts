export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
/** Equal circles retain their size. Only their separation changes, with enough
 * distance at the end to leave a clear private area on each side. */
export function connectionLayout(progress:number,narrow:boolean){
 const t=clamp(progress),width=narrow?760:1100,height=narrow?500:480;
 const radius=narrow?170:190,y=narrow?225:220;
 const distance=narrow?376-166*t:460-220*t;
 return{width,height,radius,y,left:(width-distance)/2,right:(width+distance)/2,sharedWidth:Math.max(0,2*radius-distance)};
}
/** Two arcs of the original circles bound their actual common surface. */
export function intersectionPath(left:number,right:number,y:number,radius:number){
 const distance=right-left;
 if(distance>=radius*2||distance<=0)return '';
 const x=(left+right)/2,h=Math.sqrt(radius*radius-(distance/2)**2),f=(n:number)=>n.toFixed(3);
 return `M${f(x)} ${f(y-h)} A${radius} ${radius} 0 0 1 ${f(x)} ${f(y+h)} A${radius} ${radius} 0 0 1 ${f(x)} ${f(y-h)}Z`;
}
