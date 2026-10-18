/** A single owner for the paper's pose. Scrolling never writes its transforms. */
export function initDefense(){
 const scene=document.querySelector<HTMLElement>('.defense-scene')!;
 const viewport=scene.querySelector<HTMLElement>('.defense-viewport')!;
 const target=scene.querySelector<HTMLButtonElement>('.defense-touch-target')!;
 const approach=scene.querySelector<HTMLButtonElement>('#wall-approach')!;
 const perspective=scene.querySelector<HTMLButtonElement>('#wall-perspective')!;
 const response=scene.querySelector<HTMLElement>('#wall-response')!;
 const view=scene.querySelector<HTMLElement>('#defense-view')!;
 let inside=false,held=false,proximity=0,frame=0,announced='';
 let bounds:DOMRect|undefined;

 function paint(){
  frame=0;
  const amount=inside?0:held?1:proximity;
  // A slightly flatter fan keeps each printed fold legible before it closes.
  scene.style.setProperty('--fold-angle',`${56-amount*50}deg`);
  scene.style.setProperty('--approach',amount.toFixed(3));
  scene.classList.toggle('feeling-close',amount>.65);
  const message=inside?'暖光照亮的，是没有说出口的需要。墙还在，你看见了它保护着什么。':amount>.65?'纸墙收拢，暖光只剩一道缝。想靠近的需要，仍然藏在里面。':'想靠近，也会先保护自己。';
  if(message!==announced){announced=message;response.textContent=message}
 }
 function queue(){if(!frame)frame=requestAnimationFrame(paint)}
 function setView(next:boolean){
  inside=next;held=false;proximity=0;scene.classList.toggle('inside-view',inside);
  view.textContent=inside?'内侧 · 没有说出口的需要':'外侧 · 看得见的退缩';
  perspective.setAttribute('aria-pressed',String(inside));
  perspective.innerHTML=inside?'回到墙外 <span>↶</span>':'绕到墙后 <span>↗</span>';
  approach.hidden=inside;target.disabled=inside;
  scene.querySelector<HTMLElement>('.defense-instruction')!.classList.toggle('is-inside',inside);
  syncPress();paint();
 }
 function syncPress(){
  approach.setAttribute('aria-pressed',String(held));target.setAttribute('aria-pressed',String(held));
  approach.innerHTML=held?'退回一点 <span>↓</span>':'靠近一点 <span>↑</span>';
  target.setAttribute('aria-label',held?'退回一点，让纸墙恢复原位':'靠近纸墙，观察防御收拢');
 }
 function toggleApproach(){if(inside)return;held=!held;proximity=0;syncPress();paint()}
 viewport.addEventListener('pointerenter',()=>{bounds=viewport.getBoundingClientRect()});
 viewport.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||inside||held)return;
  bounds??=viewport.getBoundingClientRect();
  const x=(e.clientX-bounds.left)/bounds.width-.5,y=(e.clientY-bounds.top)/bounds.height-.5;
  proximity=Math.max(0,1-Math.hypot(x,y)/.45);queue();
 });
 viewport.addEventListener('pointerleave',()=>{proximity=0;bounds=undefined;queue()});
 target.addEventListener('click',toggleApproach);approach.addEventListener('click',toggleApproach);
 perspective.addEventListener('click',()=>setView(!inside));
 // Geometry is measured on entry. Invalidate it when the page or viewport moves.
 window.addEventListener('scroll',()=>{bounds=undefined},{passive:true});
 window.addEventListener('resize',()=>{bounds=undefined},{passive:true});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){proximity=0;queue()}},{threshold:0}).observe(scene);
 target.disabled=false;approach.disabled=false;perspective.disabled=false;paint();
}
