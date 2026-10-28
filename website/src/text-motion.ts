/** Text changes have one owner: fade out, apply the latest value, fade in. */
type Job={animation:Animation;apply:()=>void;phase:'out'|'in';value?:string};
const jobs=new WeakMap<Element,Job>(),visibility=new WeakMap<HTMLElement,{animation:Animation;show:boolean}>();
const viewAnimations=new WeakMap<HTMLElement,Animation>();
let enabled=false;
const duration=(normal:number)=>document.body.classList.contains('reduced-motion')?Math.min(100,normal):normal;
function visible(el:Element){const r=el.getBoundingClientRect();return !document.hidden&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}
function cancel(el:Element){const job=jobs.get(el);if(job){job.animation.onfinish=null;job.animation.cancel();jobs.delete(el)}}
export function fadeText(el:Element,value:string,html=false){
 const read=()=>html?el.innerHTML:el.textContent;
 const current=jobs.get(el);
 if(current?.value===value||(!current&&read()===value))return;
 const apply=()=>{if(html)el.innerHTML=value;else el.textContent=value};
 if(!enabled||!visible(el)){cancel(el);apply();return}
 if(current?.phase==='out'){current.apply=apply;current.value=value;return}
 const opacity=Number(getComputedStyle(el).opacity);cancel(el);
 const animation=el.animate([{opacity},{opacity:0}],{duration:duration(160),easing:'ease-in',fill:'forwards'});
 const job:Job={animation,apply,phase:'out',value};jobs.set(el,job);
 animation.onfinish=()=>{
  animation.cancel();job.apply();job.phase='in';
  const base=getComputedStyle(el).opacity;
  job.animation=el.animate([{opacity:0},{opacity:base}],{duration:duration(320),easing:'ease-out',fill:'forwards'});
  job.animation.onfinish=()=>{job.animation.cancel();jobs.delete(el)};
 };
}
export function fadeVisibility(el:HTMLElement,show:boolean){
 const previous=visibility.get(el);if(previous?.show===show)return;
 const before=getComputedStyle(el).opacity;
 previous?.animation.cancel();visibility.delete(el);
 el.style.removeProperty('pointer-events');
 if(!enabled||document.hidden){el.hidden=!show;return}
 if(show&&(el.hidden||previous)){el.hidden=false;const a=el.animate([{opacity:previous?before:0},{opacity:getComputedStyle(el).opacity}],{duration:duration(280)});visibility.set(el,{animation:a,show});a.onfinish=()=>visibility.delete(el)}
 else if(!show&&!el.hidden){el.style.pointerEvents='none';const a=el.animate([{opacity:before},{opacity:0}],{duration:duration(180),fill:'forwards'});visibility.set(el,{animation:a,show});a.onfinish=()=>{el.hidden=true;a.cancel();el.style.removeProperty('pointer-events');visibility.delete(el)}}
}
export function fadeRemove(el:HTMLElement){const a=el.animate([{opacity:getComputedStyle(el).opacity},{opacity:0}],{duration:duration(180),fill:'forwards'});a.onfinish=()=>el.remove()}
export function fadeDialog(dialog:HTMLDialogElement,show:boolean){
 if(show){dialog.showModal();dialog.animate([{opacity:0},{opacity:1}],{duration:duration(300),easing:'ease-out'});return}
 if(!dialog.open||dialog.dataset.closing)return;
 dialog.dataset.closing='true';
 const a=dialog.animate([{opacity:getComputedStyle(dialog).opacity},{opacity:0}],{duration:duration(200),fill:'forwards'});
 a.onfinish=()=>{dialog.close();a.cancel();delete dialog.dataset.closing};
}
export function fadeView(from:HTMLElement,to:HTMLElement,change:()=>void){
 const opacity=getComputedStyle(from).opacity;
 viewAnimations.get(from)?.cancel();
 const a=from.animate([{opacity},{opacity:0}],{duration:duration(180),fill:'forwards'});
 viewAnimations.set(from,a);
 a.onfinish=()=>{
  change();a.cancel();viewAnimations.delete(from);viewAnimations.get(to)?.cancel();
  const enter=to.animate([{opacity:0},{opacity:1}],{duration:duration(320),easing:'ease-out'});
  viewAnimations.set(to,enter);enter.onfinish=()=>viewAnimations.delete(to);
 };
}
export function initTextMotion(){
 enabled=true;
 // Observe reading groups, never each glyph, and never hide content before JS.
 const selector='.chapter-heading,.source-block,.reading-subtitle,.model-bridge,.reference-intro,.large-quote,.flow-study figcaption,.practice-aside,.margin-title,.narrative-bridge,.mobius-caption,.mobius-touch,.mobius-steps,.mobius-coda,.dedication-end,.colophon-intro,.colophon-links,.ordinary-things,.abstract-margin,#exhibition footer,#source-reader>header';
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const el=entry.target as HTMLElement;
   if(entry.isIntersecting&&!el.closest('[hidden]')){
    el.classList.remove('text-awaiting');el.animate([{opacity:0},{opacity:1}],{duration:duration(650),easing:'ease-out'});observer.unobserve(el);
   }
  }
 },{threshold:0});
 document.querySelectorAll<HTMLElement>(selector).forEach(el=>{el.classList.add('text-awaiting');observer.observe(el)});
 document.querySelectorAll<HTMLDetailsElement>('details').forEach(details=>{
  const summary=details.querySelector('summary');if(!summary)return;
  details.addEventListener('toggle',()=>{if(details.open)[...details.children].filter(el=>el!==summary).forEach(el=>el.animate([{opacity:0},{opacity:1}],{duration:duration(300)}))});
  summary.addEventListener('click',e=>{
   e.preventDefault();const children=[...details.children].filter(el=>el!==summary) as HTMLElement[];
   if(details.dataset.closing)return;
   if(!details.open){details.open=true}
   else{
    details.dataset.closing='true';const animations=children.map(el=>el.animate([{opacity:1},{opacity:0}],{duration:duration(180),fill:'forwards'}));
    Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{details.open=false;animations.forEach(a=>a.cancel());delete details.dataset.closing});
   }
  });
 });
}
