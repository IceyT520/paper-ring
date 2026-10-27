import {fadeText} from './text-motion';
/** The same paper rests flat, then takes two different protective postures. */
export function initOrigin(){
 const scene=document.querySelector<HTMLElement>('.origin-scene')!;
 const button=document.querySelector<HTMLButtonElement>('#origin-reveal')!;
 const action=document.querySelector<HTMLElement>('#origin-action')!,response=document.querySelector<HTMLElement>('#origin-response')!;
 let unfolded=false,entered=false;
 const quiet=()=>document.body.classList.contains('reduced-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function setView(value:boolean){
  unfolded=value;scene.dataset.state=value?'unfolded':'protected';button.setAttribute('aria-pressed',String(value));
  fadeText(action,value?'再看两种保护':'轻触，放下防御');
  fadeText(response,value?'把防御轻轻放下，纸褶下面，都写着“想被爱”。':'一个把需要收进纸褶，一个把需要向外展开。');
 }
 button.addEventListener('click',()=>{entered=true;scene.classList.remove('origin-preparing');setView(!unfolded)});
 // One entrance only; coming back preserves the reader's chosen view.
 if(!quiet()){
  scene.classList.add('origin-preparing');setView(true);
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(e=>e.isIntersecting))return;
   observer.disconnect();if(entered)return;entered=true;
   scene.classList.remove('origin-preparing');requestAnimationFrame(()=>setView(false));
  },{threshold:.4});observer.observe(scene);
 }
}
