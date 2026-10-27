import {fadeText,fadeVisibility,fadeRemove} from './text-motion';
import {initDefense} from './defense';
import {initOrigin} from './origin';
/** Update only composited light layers, never inherited styles on the article. */
const lights=[[.26,.19],[.19,.22],[.31,.2],[.43,.11],[.16,.4],[.31,.31],[.32,.27],[.28,.22],[.3,.28],[.19,.26],[.15,.23],[.16,.17]];
const blueGlow=document.querySelector<HTMLElement>('.atmosphere-blue')!,redGlow=document.querySelector<HTMLElement>('.atmosphere-red')!;
let lastLight='';
export function updateAtmosphere(chapter:number,progress:number){
 const i=Math.max(0,Math.min(11,chapter-1)),a=lights[i],b=lights[Math.min(11,i+1)];
 const t=Math.max(0,Math.min(1,(progress-.55)/.45)),smooth=t*t*(3-2*t);
 const blue=(a[0]+(b[0]-a[0])*smooth).toFixed(2),red=(a[1]+(b[1]-a[1])*smooth).toFixed(2);
 if(lastLight===blue+red)return;lastLight=blue+red;blueGlow.style.opacity=blue;redGlow.style.opacity=red;
}
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const quiet=()=>document.body.classList.contains('reduced-motion');
export function initJourney(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{rootMargin:'40px'});
 document.querySelectorAll('[data-art],.signal-art').forEach(el=>observer.observe(el));
 document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-hidden',document.hidden));
 initLetter();initEcho();initPromises();initDefense();initOrigin();
 $('#cave-lamp').addEventListener('click',()=>{
  const on=$('.cave-art').classList.toggle('lamp-on');$('#cave-lamp').setAttribute('aria-pressed',String(on));
  fadeText($('#cave-lamp'),(on?'收起这盏灯':'在门口，留一盏灯')+' <span>↗</span>',true);
  fadeText($('#cave-caption'),on?'我在这里，等你准备好。光停在门口，没有替你推开门。':'让光照进去，也保留一个人的空间。');
 });
}
/** Throw a note: only transform and opacity animate during its flight. */
function initLetter(){
 const note=$<HTMLButtonElement>('#send-signal'),scene=$('.letter-flight'),destination=$('.letter-destination'),status=$('#signal-status'),reset=$('#signal-reset');
 let animation:Animation|undefined,drag:{x:number;y:number;dx:number;dy:number}|undefined,sent=false,suppressClick=false;
 function landing(){
  const width=note.offsetWidth,height=note.offsetHeight;
  const from={x:note.offsetLeft+width/2,y:note.offsetTop+height/2};
  const to={x:destination.offsetLeft+destination.offsetWidth/2,y:destination.offsetTop+destination.offsetHeight/2};
  const matrix=new DOMMatrixReadOnly(getComputedStyle(destination).transform);
  const angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
  const scale=Math.min((destination.clientWidth-12)/width,(destination.clientHeight-12)/height);
  return{from,to,x:to.x-from.x,y:to.y-from.y,angle,scale};
 }
 function endTransform(){const p=landing();return `translate(${p.x}px,${p.y}px) rotate(${p.angle}deg) scale(${p.scale})`}
 function layoutRoute(){
  if(!scene.clientWidth||!note.offsetWidth)return;
  const {from,to}=landing(),route=scene.querySelector<SVGSVGElement>('.flight-thread')!;
  route.setAttribute('viewBox',`0 0 ${scene.clientWidth} ${scene.clientHeight}`);
  route.querySelector('path')!.setAttribute('d',`M${from.x} ${from.y}C${from.x+90} ${from.y-25} ${to.x-90} ${to.y-25} ${to.x} ${to.y}`);
  if(sent){animation?.cancel();animation=undefined;note.style.transform=endTransform();arrive()}
 }
 function restore(){animation?.cancel();animation=undefined;sent=false;drag=undefined;note.style.transform='';scene.classList.remove('sent','arrived','held');fadeVisibility(reset,false);note.setAttribute('aria-label','投出这封信，也可以向右拖动松手');fadeText(status,'按一下，也能把想念送出去。')}
 function arrive(){scene.classList.add('arrived');fadeText(status,'信已抵达。想念留在了彼处，回应仍是一个未知。');note.setAttribute('aria-label','信已抵达，可以取回后再发送')}
 function springBack(dx:number,dy:number){
  if(quiet()||Math.abs(dx)<2&&Math.abs(dy)<2){note.style.transform='';return}
  const anim=note.animate([
   {transform:`translate(${dx}px,${dy}px) rotate(${-8+dx*.07}deg)`,offset:0},
   {transform:`translate(${dx*.68-14}px,${dy*.6-10}px) rotate(${-3+dx*.05}deg)`,offset:.34},
   {transform:'translate(-8px,-6px) rotate(-10.6deg)',offset:.66},
   {transform:'translate(3px,-2px) rotate(-8.4deg)',offset:.86},
   {transform:'none'}
  ],{duration:720,easing:'cubic-bezier(.25,.9,.3,1)'});
  anim.onfinish=()=>{note.style.transform=''};
 }
 function suppressNextClick(){
  suppressClick=true;
  // A drag may end outside the letter, so its click never reaches the handler.
  setTimeout(()=>{suppressClick=false},450);
 }
 function send(dx=0,dy=0){
  if(sent)return;sent=true;scene.classList.remove('held');scene.classList.add('sent');fadeVisibility(reset,true);
  const {x:endX,y:endY}=landing();fadeText(status,'想念已出发。此刻，还不知道对方什么时候看见。');
  const end=endTransform();
  if(quiet()){note.style.transform=end;arrive();return}
  const back=Math.min(34,Math.max(14,dx*.45));
  animation=note.animate([
   {transform:`translate(${dx}px,${dy}px) rotate(${-8+dx*.07}deg)`,offset:0},
   // The recoil before the throw: the hand lets go and the paper settles back first.
   {transform:`translate(${dx-back}px,${dy-back*.5}px) rotate(${-12+dx*.05}deg)`,offset:.12},
   {transform:`translate(${dx*.72}px,${dy*.6-26}px) rotate(-15deg) scale(1.03)`,offset:.3},
   {transform:`translate(${endX*.45}px,${endY-70}px) rotate(-21deg) scale(.84)`,offset:.62},
   {transform:end}
  ],{duration:1950,easing:'cubic-bezier(.34,.72,.3,1)',fill:'forwards'});animation.onfinish=arrive;
 }
 note.addEventListener('pointerdown',e=>{if(sent)return;drag={x:e.clientX,y:e.clientY,dx:0,dy:0};note.setPointerCapture(e.pointerId);scene.classList.add('held')});
 note.addEventListener('pointermove',e=>{if(!drag)return;drag.dx=Math.max(-35,Math.min(scene.clientWidth*.7,e.clientX-drag.x));drag.dy=Math.max(-100,Math.min(70,e.clientY-drag.y));note.style.transform=`translate(${drag.dx}px,${drag.dy}px) rotate(${-8+drag.dx*.07}deg)`});
 note.addEventListener('pointerup',()=>{
  if(!drag)return;const {dx,dy}=drag;drag=undefined;scene.classList.remove('held');
  if(dx>64){suppressNextClick();send(dx,dy);return}
  // A short pull springs back instead of being read as a click.
  if(Math.abs(dx)>3||Math.abs(dy)>3)suppressNextClick();
  springBack(dx,dy);
 });
 note.addEventListener('pointercancel',()=>{drag=undefined;scene.classList.remove('held');springBack(0,0)});
 note.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return}send()});reset.addEventListener('click',restore);
 new ResizeObserver(layoutRoute).observe(scene);layoutRoute();
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&animation?.playState==='running')animation.finish()}).observe(scene);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&animation?.playState==='running')animation.finish()});
}
/** Calls accumulate; a response draws those same fragments back in. */
function initEcho(){
 const chamber=$('.echo-chamber'),instrument=$('.anxious-instrument'),ripples=$('#echo-ripples'),words=$('#echo-words');
 const phrases=['你在吗？','是不是太忙了？','我是不是说错了？','为什么不回我？','你还在吗？','别推我走。'];
 const positions=[[12,22],[65,15],[77,43],[10,64],[66,76],[27,85]];
 let count=0,answered=false;
 function pulse(answer=false){
  if(quiet())return;while(ripples.childElementCount>=6)ripples.firstElementChild?.remove();
  const ring=document.createElement('i');ring.className=answer?'echo-ripple reply-ripple':'echo-ripple';ripples.append(ring);
  const a=ring.animate([{transform:'translate(-50%,-50%) scale(.15)',opacity:0},{opacity:.7,offset:.12},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:answer?1500:2200,easing:'cubic-bezier(.16,.55,.25,1)'});a.onfinish=()=>ring.remove();
 }
 $('#call-need').addEventListener('click',()=>{
  if(answered){count=0;[...words.children].forEach(el=>{(el as HTMLElement).dataset.retiring='true';fadeRemove(el as HTMLElement)});instrument.classList.remove('answered');answered=false;$('#answer-need').setAttribute('aria-pressed','false')}
  count++;chamber.dataset.calls=String(count);pulse();
  const remaining=words.querySelectorAll(':scope>span:not([data-retiring])').length;
  if(remaining<6){const i=remaining,word=document.createElement('span');word.textContent=phrases[i];word.style.left=positions[i][0]+'%';word.style.top=positions[i][1]+'%';word.style.rotate=(i%2?5:-7)+'deg';words.append(word);word.animate(quiet()?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:quiet()?100:450})}
  fadeText($('.disc-word'),count<3?'听见我':count<5?'我很害怕':'别推我走');
  fadeText($('#need-response'),count<3?'每一声都在等待回音。再叩一下，呼唤会留下新的痕迹。':'越来越多的话，占满了空间。它们背后，仍是同一个小小的需要。');
 });
 $('#answer-need').addEventListener('click',()=>{
  if(answered)return;answered=true;instrument.classList.add('answered');$('#answer-need').setAttribute('aria-pressed','true');pulse(true);
  fadeText($('.disc-word'),'我听见了');fadeText($('#need-response'),'我现在有些忙，但我听见你了，晚一点我们好好聊。');
  [...words.querySelectorAll(':scope>span:not([data-retiring])')].forEach((el,i)=>{const node=el as HTMLElement;if(quiet()){node.animate([{opacity:1},{opacity:0}],{duration:100,fill:'forwards'});return}node.animate([{opacity:1,transform:'translate(0,0)'},{opacity:0,transform:`translate(${(50-positions[i][0])*chamber.clientWidth/100}px,${(42-positions[i][1])*chamber.clientHeight/100}px) scale(.5)`}],{duration:900,delay:i*65,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'})});
 });
 const stop=()=>{chamber.getAnimations({subtree:true}).forEach(a=>a.finish());ripples.replaceChildren()};
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop()}).observe(chamber);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
}
function initPromises(){
 const scene=$('.rhythm-instrument'),pins=[...scene.querySelectorAll<HTMLButtonElement>('[data-promise]')];
 const copy=[['给一天，留一句问候。','约定一个双方方便的时刻，分享今天一件很小的事。'],['离开前，留下一个归期。','需要独处或暂时忙碌时，先说一声，也说好何时再联系。'],['重要的话，认真听。','把重要的话题留给双方都能专注的时间，先听见彼此的需要。'],['让远方，慢慢有日期。','一起聊聊下一次见面，以及共同生活的愿望和安排。']];
 const active=new Set<number>();
 function draw(index:number){
  pins.forEach((pin,i)=>{pin.setAttribute('aria-pressed',String(active.has(i)));scene.querySelector(`[data-stitch="${i}"]`)?.classList.toggle('sewn',active.has(i))});
  fadeText($('#promise-count'),String(active.size).padStart(2,'0')+' / 04');
  fadeText($('#rhythm-caption'),active.size===4?'线仍各自延伸，约定让我们相遇。':index<0?'在两条线之间，缝下一次约定。':copy[index][0]);
  fadeText($('#promise-detail'),index<0?'点亮针孔。保留各自的走向，也留下可以相遇的时刻。':copy[index][1]);scene.classList.toggle('all-sewn',active.size===4);
 }
 pins.forEach((pin,i)=>pin.addEventListener('click',()=>{if(active.has(i))active.delete(i);else active.add(i);draw(i);if(!quiet()&&active.has(i))pin.animate([{transform:'translate(-50%,-50%) scale(.82)'},{transform:'translate(-50%,-50%) scale(1.14)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:550})}));
 $('#promise-reset').addEventListener('click',()=>{active.clear();draw(-1)});
}
