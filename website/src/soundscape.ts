/** Scene changes set a target once; the audio owner performs a finite fade. */
export function initSoundscape(setLevel:(level:number)=>void){
 const profiles:[string,number,number][]=[
  ['.hero',.3,0],['.prose',.07,2],['.model-source',.065,2],['#simulator',.09,3],
  ['#mirror-installation',.17,3],['.mobius-sticky',.24,3],
  ['#chapter-10',.07,1],['#chapter-11 .waiting-scene',.18,3],
  ['.dedication-copy',.06,2],['.dedication-end',0,4],['#chapter-12',.04,1],
 ];
 const zones=new Map<Element,{level:number;priority:number}>(),active=new Set<Element>();
 for(const [selector,level,priority] of profiles)document.querySelectorAll(selector).forEach(el=>zones.set(el,{level,priority}));
 let previous=-1;
 function sync(){
  let level=.12,priority=-1;
  for(const element of active){const zone=zones.get(element)!;if(zone.priority>priority){priority=zone.priority;level=zone.level}}
  if(document.body.classList.contains('reader-mode'))level=.05;
  if(document.hidden)level=0;
  if(level!==previous){previous=level;setLevel(level)}
 }
 const observer=new IntersectionObserver(entries=>{
  for(const e of entries){if(e.isIntersecting)active.add(e.target);else active.delete(e.target)}sync();
 },{rootMargin:'-25% 0px -40% 0px',threshold:0});
 zones.forEach((_,el)=>observer.observe(el));
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);sync();
}
