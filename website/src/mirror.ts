import {connectionLayout,connectionPath,connectionPoint,roomFacets,type Room} from './connection-geometry';

/** Safety is shown through two observable actions: room to be oneself and a
 *  reachable partner. Taking space never removes the bridge or moves red. */
export function initMirror(){
 const scene=document.querySelector<HTMLElement>('#mirror-installation')!;
 const $=<T extends Element=HTMLElement>(s:string)=>scene.querySelector<T>(s)!;
 const svg=$<SVGSVGElement>('.connection-art'),stage=$('.connection-stage');
 const spaceButton=$<HTMLButtonElement>('#connection-space'),callButton=$<HTMLButtonElement>('#connection-call');
 const replay=$<HTMLButtonElement>('#connection-replay'),status=$('#connection-status');
 const blueMessage=$('#connection-blue-message'),redMessage=$('#connection-red-message');
 const paths=[...scene.querySelectorAll<SVGPathElement>('.connection-road-shadow,.connection-road,#connection-path')];
 const path=$<SVGPathElement>('#connection-path');
 const traveler=$<SVGCircleElement>('.connection-traveler'),halo=$<SVGCircleElement>('.connection-traveler-halo');
 const quiet=()=>document.body.classList.contains('reduced-motion');
 const sides=['blue','red'] as const;
 const rooms=sides.map(side=>({
  floor:$<SVGGElement>(`.connection-floor-${side}`),
  ellipses:[...scene.querySelectorAll<SVGEllipseElement>(`.connection-floor-${side} ellipse`)],
  walls:[...scene.querySelectorAll<SVGPathElement>(`.connection-walls-${side} .room-wall`)],
  rims:[...scene.querySelectorAll<SVGPathElement>(`.connection-walls-${side} .room-rim`)],
  label:$<SVGTextElement>(`.boundary-${side}`),
  button:side==='blue'?spaceButton:callButton,message:side==='blue'?blueMessage:redMessage
 }));
 let space=0,targetSpace=0,fromSpace=0,narrow=matchMedia('(max-width:760px)').matches;
 let layout=connectionLayout(space,narrow),visible=false,entered=false,frame=0,started=0;
 let action:'intro'|'space'|'call'|'rest'='rest',phase='',responseCount=0;
 const clamp=(v:number)=>Math.max(0,Math.min(1,v));
 const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
 const f=(v:number)=>v.toFixed(3);
 const point=(el:HTMLElement,x:number,y:number)=>{
  el.style.left=`${f(x/layout.width*100)}%`;el.style.top=`${f(y/layout.height*100)}%`;
 };
 function drawRoom(room:Room,index:number,angle:number){
  const el=rooms[index];el.floor.setAttribute('transform',`translate(${f(room.x)} ${f(room.y)})`);
  // One lighting field spans the paper wall. Restarting a gradient for every
  // facet would turn the curved sheet into a striped metal shutter.
  const material=$<SVGLinearGradientElement>(`#room-paper-${sides[index]}`);
  material.setAttribute('gradientUnits','userSpaceOnUse');
  material.setAttribute('x1',f(room.x-room.radius));material.setAttribute('x2',f(room.x+room.radius));
  material.setAttribute('y1',f(room.y-room.radius*.46-room.height));material.setAttribute('y2',f(room.y+room.radius*.46));
  el.ellipses.forEach((ellipse,i)=>{
   const scale=[1.08,1,.86,.7][i];ellipse.setAttribute('rx',f(room.radius*scale));ellipse.setAttribute('ry',f(room.radius*.46*scale));
  });
  roomFacets(room,angle).forEach((facet,i)=>{
   el.walls[i].setAttribute('d',facet.body);el.walls[i].setAttribute('opacity',f(facet.light));el.rims[i].setAttribute('d',facet.rim);
  });
  el.label.setAttribute('x',f(room.x));el.label.setAttribute('y',f(room.y+room.radius*.46+28));
  point(el.button,room.x,room.y);point(el.message,room.x,room.y-room.radius*.46-room.height-25);
 }
 function geometry(){
  layout=connectionLayout(space,narrow);svg.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`);
  drawRoom(layout.left,0,layout.angle);drawRoom(layout.right,1,layout.angle+Math.PI);
  const d=connectionPath(layout);paths.forEach(p=>p.setAttribute('d',d));
  const gradient=$<SVGLinearGradientElement>('#connection-gold');
  gradient.setAttribute('x1',String(layout.left.x));gradient.setAttribute('x2',String(layout.right.x));
 }
 function light(t:number,show:boolean){
  const p=connectionPoint(layout,clamp(t));
  for(const node of [traveler,halo]){
   node.setAttribute('cx',f(p.x));node.setAttribute('cy',f(p.y));node.style.opacity=show?'1':'0';
  }
 }
 function say(next:string){
  if(phase===next)return;phase=next;scene.dataset.phase=next;
  if(action==='call'){
   redMessage.textContent='你在吗';
   blueMessage.textContent=next==='sent'?'':targetSpace?'我在，晚一点再聊':'我在';
   status.textContent=next==='sent'?'需要被说出来，也有一条路能够抵达':targetSpace?'即使正在独处，也能给出清楚的回应':'你发出的呼唤，得到了回应';
  }
  if(action==='space'){
   blueMessage.textContent=targetSpace?'我想安静一会儿':'我准备好靠近了';
   redMessage.textContent=next==='moving'?'':targetSpace?'好，我在这里':'我在';
   status.textContent=targetSpace?'留出自己的空间，联结仍然完整':'靠近，是带着自己来到你身边';
  }
 }
 function finish(){
  cancelAnimationFrame(frame);frame=0;
  if(space!==targetSpace){space=targetSpace;geometry()}
  path.style.strokeDashoffset='0';light(0,false);
  if(action==='call'){say('replied');scene.dataset.response=String(++responseCount)}
  else if(action==='space')say('answered');
  else if(action==='intro')status.textContent='靠近时保有自己，独处时也知道你在';
  scene.dataset.animating='false';scene.dataset.phase='rest';action='rest';
 }
 function tick(now:number){
  frame=0;
  if(!visible||document.hidden||quiet()||document.body.classList.contains('reader-mode')){finish();return}
  if(!started)started=now;
  const elapsed=now-started,duration=action==='call'?3000:action==='space'?2300:2200,p=clamp(elapsed/duration);
  if(space!==targetSpace){
   space=fromSpace+(targetSpace-fromSpace)*smooth(elapsed/1600);
   if(elapsed>=1600)space=targetSpace;
   geometry();
  }
  if(action==='call'){
   say(p<.42?'sent':p<.85?'answering':'received');
   light(p<.42?1-smooth(p/.42):smooth((p-.42)/.43),p<.97);
  }else if(action==='space'){
   say(p<.48?'moving':'answered');
   light(1-smooth(p),true);
  }else if(action==='intro'){
   path.style.strokeDashoffset=f(1-smooth(p));
   light(smooth(p),true);
  }
  if(p>=1){finish();return}
  frame=requestAnimationFrame(tick);
 }
 function begin(next:typeof action){
  // A new action replaces the previous one without losing an in-flight choice.
  cancelAnimationFrame(frame);frame=0;fromSpace=space;started=0;phase='';action=next;entered=true;
  scene.dataset.animating='true';path.style.strokeDashoffset=next==='intro'?'1':'0';
  scene.dataset.space=targetSpace?'apart':'together';spaceButton.setAttribute('aria-pressed',String(!!targetSpace));
  $('#connection-space-action').textContent=targetSpace?'准备好，再靠近 ↘':'留一点空间 ↖';
  spaceButton.setAttribute('aria-label',targetSpace?'准备好，再靠近一点':'留一点自己的空间，观察联结是否仍在');
  if(next==='intro'){blueMessage.textContent='';redMessage.textContent='';status.textContent='各自拥有空间，彼此仍然可达'}
  else say(next==='call'?'sent':'moving');
  if(quiet()||!visible||document.hidden){finish();return}
  frame=requestAnimationFrame(tick);
 }
 spaceButton.addEventListener('click',()=>{targetSpace=targetSpace?0:1;begin('space')});
 callButton.addEventListener('click',()=>begin('call'));
 replay.addEventListener('click',()=>{targetSpace=0;begin('intro')});
 [spaceButton,callButton,replay].forEach(button=>button.disabled=false);
 geometry();light(0,false);scene.dataset.animating='false';
 const resizeObserver=new ResizeObserver(()=>{
  const next=matchMedia('(max-width:760px)').matches;
  if(next===narrow)return;narrow=next;geometry();
 });
 resizeObserver.observe(stage);
 new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(!visible){if(action!=='rest')finish();return}
  if(!entered){entered=true;if(!quiet())begin('intro')}
 },{threshold:.18}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&action!=='rest')finish()});
 new MutationObserver(()=>{
  if(action!=='rest'&&(quiet()||document.body.classList.contains('reader-mode')))finish();
 }).observe(document.body,{attributes:true,attributeFilter:['class']});
}
