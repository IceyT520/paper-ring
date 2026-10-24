/** One small comparison: keep the same private spaces, make the return leg explicit. */
export function initNarrative(){
 const scene=document.querySelector<HTMLElement>('#buffer-scene')!;
 const offer=scene.querySelector<HTMLButtonElement>('#buffer-offer')!;
 const reset=scene.querySelector<HTMLButtonElement>('#buffer-reset')!;
 function show(on:boolean){
  scene.classList.toggle('has-return',on);offer.setAttribute('aria-pressed',String(on));
  scene.querySelector<HTMLElement>('.return-time')!.hidden=!on;
  scene.querySelector<HTMLElement>('.buffer-unknown')!.hidden=on;
  reset.hidden=!on;
  scene.querySelector('#buffer-other-copy')!.textContent=on?'知道何时再联系':'不知道等到什么时候';
  scene.querySelector('#buffer-status')!.textContent=on?'距离和独处的空间都还在。多出来的，是双方可以依靠的下一次联系。':'独处的需要已经说出，等待的另一端还没有时间可以依靠。';
 }
 offer.addEventListener('click',()=>show(true));
 reset.addEventListener('click',()=>{show(false);offer.focus({preventScroll:true})});
}
