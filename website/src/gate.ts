/** The sealed envelope: one gesture before the exhibition.
 *  Breaking the seal starts the soundtrack and lets the opening run. */
export function initGate(reduced:boolean){
 const foundGate=document.querySelector<HTMLElement>('#gate');
 const foundOpen=document.querySelector<HTMLButtonElement>('#gate-open');
 if(!foundGate||!foundOpen)return{active:false,onOpen(){}};
 const gate=foundGate,open=foundOpen;
 const root=document.documentElement,listeners:Array<()=>void>=[];
 let done=false;

 root.dataset.gate='sealed';gate.hidden=false;
 requestAnimationFrame(()=>gate.classList.add('is-ready'));

 function reveal(){
  if(done)return;done=true;
  // Dispatch inside the gesture so the browser allows the soundtrack to start.
  document.dispatchEvent(new CustomEvent('paper:gate-open'));
  gate.classList.add('is-open');
  delete root.dataset.gate;
  const leave=reduced?90:760,hide=reduced?220:1080;
  setTimeout(()=>gate.classList.add('is-leaving'),leave);
  setTimeout(()=>{
   gate.hidden=true;gate.classList.remove('is-ready','is-open','is-leaving');
   listeners.forEach(fn=>fn());
   const next=document.querySelector<HTMLButtonElement>('#skip-opening');
   (next&&!next.hidden?next:open).focus({preventScroll:true});
  },hide);
 }

 open.addEventListener('click',reveal);
 document.addEventListener('keydown',event=>{
  if(done)return;
  if(event.key==='Tab'){event.preventDefault();open.focus({preventScroll:true});return}
  if(event.key==='Enter'||event.key===' '||event.key==='Escape'){event.preventDefault();reveal()}
 });
 return{active:true,onOpen(fn:()=>void){listeners.push(fn)}};
}
