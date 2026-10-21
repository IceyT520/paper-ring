import {connectionLayout,intersectionPath,smooth} from './connection-geometry';

/** One gesture, three legible regions. The original two statements stay in
 * ordinary HTML and remain visible for every frame, including replay. */
export function initMirror(){
 const scene=document.querySelector<HTMLElement>('#mirror-installation')!;
 const $=<T extends Element=HTMLElement>(s:string)=>scene.querySelector<T>(s)!;
 const button=$<HTMLButtonElement>('#connection-meet'),svg=$<SVGSVGElement>('.lens-art');
 const shared=$<SVGPathElement>('#lens-shared'),action=$('#lens-action-text');
 const surfaces=['blue','red'].map(side=>({
  group:$<SVGGElement>(`#lens-${side}`),circles:[...scene.querySelectorAll<SVGCircleElement>(`#lens-${side} circle`)],
  shine:$<SVGPathElement>(`#lens-${side} .lens-shine`),label:$(`#lens-${side}-label`)
 }));
 let progress=0,frame=0,start=0,replay=false,visible=false,narrow=matchMedia('(max-width:760px)').matches;
 const quiet=()=>document.body.classList.contains('reduced-motion');
 function draw(){
  const l=connectionLayout(progress,narrow);
  surfaces.forEach((surface,i)=>{
   const x=i?l.right:l.left;
   surface.group.setAttribute('transform',`translate(${x.toFixed(3)} ${l.y})`);
   surface.label.style.left=`${(x+(i?1:-1)*l.radius*.34)/l.width*100}%`;
   surface.label.style.top=`${l.y/l.height*100}%`;
  });
  shared.setAttribute('d',intersectionPath(l.left,l.right,l.y,l.radius));
  // The word is revealed only when the intersection can physically hold it.
  $('#lens-shared-label').style.opacity=String(smooth((l.sharedWidth-28)/65));
 }
 function resize(){
  const l=connectionLayout(progress,narrow);svg.setAttribute('viewBox',`0 0 ${l.width} ${l.height}`);
  for(const surface of surfaces){
   surface.circles.forEach((circle,i)=>circle.setAttribute('r',String(l.radius+[2,0,0,-4][i])));
   const r=l.radius;
   surface.shine.setAttribute('d',`M${-r*Math.sqrt(3)/2} ${-r/2} A${r} ${r} 0 0 1 ${r/2} ${-r*Math.sqrt(3)/2}`);
  }
  $('#lens-shared-label').style.top=`${l.y/l.height*100}%`;draw();
 }
 function finish(){
  cancelAnimationFrame(frame);frame=0;progress=1;draw();
  scene.dataset.connected='true';scene.dataset.animating='false';button.setAttribute('aria-busy','false');
  button.setAttribute('aria-label','再看一次：两个完整的空间靠近，交叠处成为共同空间');
  action.textContent='再次轻触，重看一次';
  $('#lens-status').textContent='我的空间、你的空间，也有我们的空间';
 }
 function tick(now:number){
  frame=0;
  if(!visible||document.hidden||quiet()||document.body.classList.contains('reader-mode')){finish();return}
  if(!start)start=now;
  const elapsed=now-start;
  if(replay&&elapsed<600)progress=1-smooth(elapsed/600);
  else progress=smooth((elapsed-(replay?600:0))/2400);
  draw();
  if(elapsed>=(replay?3000:2400)){finish();return}
  frame=requestAnimationFrame(tick);
 }
 button.disabled=false;button.addEventListener('click',()=>{
  if(frame)return;
  replay=progress===1;start=0;scene.dataset.animating='true';button.setAttribute('aria-busy','true');
  action.textContent='靠近，也为彼此留出空间';
  if(quiet()||!visible||document.hidden){finish();return}
  frame=requestAnimationFrame(tick);
 });
 resize();scene.dataset.animating='false';scene.dataset.ready='true';
 new ResizeObserver(()=>{
  const next=matchMedia('(max-width:760px)').matches;if(next===narrow)return;narrow=next;resize();
 }).observe(button);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frame)finish()},{threshold:.1}).observe(button);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame)finish()});
 new MutationObserver(()=>{if(frame&&(quiet()||document.body.classList.contains('reader-mode')))finish()}).observe(document.body,{attributes:true,attributeFilter:['class']});
}
