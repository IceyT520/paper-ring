import {createCourtyard,visitRoom,project,polygon,personPoint,floorFold,doorPanel,smooth,type Side,type World} from './connection-geometry';

/** A room is never traded for closeness. Each person unfolds an extra leaf;
 * the courtyard and the two places at its table survive a return to solitude. */
export function initMirror(){
 const scene=document.querySelector<HTMLElement>('#mirror-installation')!;
 const $=<T extends Element=HTMLElement>(s:string)=>scene.querySelector<T>(s)!;
 const svg=$<SVGSVGElement>('.court-art'),stage=$('.court-stage');
 const status=$('#court-status'),hint=$('#court-hint'),reset=$<HTMLButtonElement>('#court-reset');
 const sides:Side[]=['blue','red'];
 const rooms=sides.map(side=>({side,
  button:$<HTMLButtonElement>(`#court-room-${side}`),
  action:$(`#court-room-${side} .court-action`),
  door:$<SVGPathElement>(`#court-door-${side}`),
  person:$<SVGGElement>(`#court-person-${side}`),
  folds:[...scene.querySelectorAll<SVGPathElement>(`#court-fold-${side} path`)],
  reservation:$(`#court-reserved-${side}`)
 }));
 const shapes=[...scene.querySelectorAll<SVGPathElement>('[data-points]')].map(el=>({el,points:JSON.parse(el.dataset.points!) as World[]}));
 const canopy=$<SVGGElement>('#court-canopy'),common=$<SVGGElement>('#court-common');
 let state=createCourtyard(),narrow=matchMedia('(max-width:760px)').matches;
 let visible=false,frame=0,start=0;
 // door, folded floor, person: blue then red; finally the shared architecture.
 let values=[0,0,0,0,0,0,0],from=values.slice(),target=values.slice();
 const quiet=()=>document.body.classList.contains('reduced-motion');
 const put=(el:HTMLElement,w:World)=>{
  const p=project(w,narrow);el.style.left=`${p.x/(narrow?760:1100)*100}%`;el.style.top=`${p.y/(narrow?850:530)*100}%`;
 };
 function resize(){
  svg.setAttribute('viewBox',narrow?'0 0 760 850':'0 0 1100 530');
  shapes.forEach(({el,points})=>el.setAttribute('d',polygon(points,narrow)));
  rooms.forEach(({button,reservation},i)=>{
   const sign=i?-1:1;
   put(button,{u:-sign*320,v:-83,z:0});
   put(reservation,{u:-sign*95,v:-34,z:0});
  });
  put($('.court-common-label'),{u:0,v:165,z:235});
  if(narrow){
   $('.court-common-label').style.left='75%';$('.court-common-label').style.top='24%';
   rooms[0].button.style.left='21%';
  }
  put($('.court-fold-note'),{u:0,v:70,z:6});
  const material=$<SVGLinearGradientElement>('#court-fold-paper');
  material.setAttribute('gradientUnits','userSpaceOnUse');
  const a=project({u:-200,v:90,z:0},narrow),b=project({u:200,v:90,z:0},narrow);
  for(const [key,v] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))material.setAttribute(key,String(v));
  draw();
 }
 function draw(){
  rooms.forEach((room,i)=>{
   const offset=i*3;
   room.door.setAttribute('d',polygon(doorPanel(room.side,values[offset]),narrow));
   floorFold(room.side,values[offset+1]).forEach((facet,k)=>{
    room.folds[k].setAttribute('d',polygon(facet,narrow));
    room.folds[k].style.opacity=String(.98-(1-values[offset+1])*(k%2?.4:.08));
   });
   const p=project(personPoint(room.side,values[offset+2]),narrow);
   room.person.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
   room.reservation.style.opacity=state.established&&!state[room.side]?String(values[6]*(1-values[offset+2])):'0';
  });
  const p=project({u:0,v:165,z:0},narrow),build=values[6];
  common.style.opacity=String(build);
  canopy.setAttribute('transform',`translate(0 ${(p.y*(1-build)).toFixed(2)}) scale(1 ${Math.max(.001,build).toFixed(4)})`);
  scene.style.setProperty('--court-built',String(build));
 }
 function copy(){
  scene.dataset.established=String(state.established);
  rooms.forEach(({side,button,action})=>{
   const visiting=state[side];scene.dataset[side]=visiting?'courtyard':'home';
   button.setAttribute('aria-pressed',String(visiting));
   button.setAttribute('aria-label',`${side==='blue'?'我':'你'}的房间：${visiting?'回房间独处':'推门去共同庭院'}`);
   action.innerHTML=visiting?'回房间独处 <i aria-hidden="true">↙</i>':'推门去庭院 <i aria-hidden="true">↗</i>';
  });
  if(!state.openedBlue&&!state.openedRed){
   status.textContent='有一个我，有一个你，也有一个我们';hint.textContent='分别轻触两间房，推开各自的门';
  }else if(!state.established){
   status.textContent='先留出一半，另一半由你决定';hint.textContent=`再轻触${state.openedBlue?'红色':'蓝色'}的房间，一起展开中间的空间`;
  }else if(state.blue&&state.red){
   status.textContent='各自的房间之外，长出了我们的庭院';hint.textContent='再点任一房间，试着回去独处';
  }else if(state.blue||state.red){
   status.textContent='一个人回去独处，另一个人也不必追';hint.textContent='庭院没有收起，空下来的位置，仍然为你留着';
  }else{
   status.textContent='各自安静的时候，我们的空间仍然在';hint.textContent='想见面时，再推开自己的门，回来坐一会儿';
  }
  $('#court-common-note').textContent=state.established?'可以相聚，也可以安心离开':'由两个人，一起展开';
 }
 function finish(){
  cancelAnimationFrame(frame);frame=0;values=target.slice();draw();scene.dataset.animating='false';
 }
 function tick(now:number){
  frame=0;
  if(!visible||document.hidden||quiet()||document.body.classList.contains('reader-mode')){finish();return}
  if(!start)start=now;
  const elapsed=(now-start)/2800;
  values=from.map((v,i)=>{
   let t=elapsed;
   if(i===6)t=(elapsed-.5)/.5;
   else if(i%3===0)t=target[i]>v?elapsed/.32:(elapsed-.68)/.32;
   else if(i%3===1)t=target[i]>=v?elapsed/.48:(elapsed-.65)/.35;
   else t=target[i]>v?(elapsed-.36)/.54:elapsed/.64;
   return v+(target[i]-v)*smooth(t);
  });
  draw();
  if(elapsed>=1){finish();return}
  frame=requestAnimationFrame(tick);
 }
 function animate(){
  cancelAnimationFrame(frame);frame=0;start=0;from=values.slice();
  target=[+state.blue,+state.openedBlue,+state.blue,+state.red,+state.openedRed,+state.red,+state.established];
  copy();scene.dataset.animating='true';
  if(quiet()||!visible||document.hidden){finish();return}
  frame=requestAnimationFrame(tick);
 }
 const visit=(side:Side)=>{state=visitRoom(state,side);animate()};
 rooms.forEach(({side,button})=>{button.disabled=false;button.addEventListener('click',()=>visit(side))});
 // Object clicks and native buttons are the same action; no pointer capture or
 // touchmove handler, so touching the model never prevents normal page scroll.
 scene.querySelectorAll<SVGPathElement>('.court-touch').forEach(el=>el.addEventListener('click',()=>visit(el.dataset.side as Side)));
 reset.disabled=false;reset.addEventListener('click',()=>{state=createCourtyard();animate()});
 copy();resize();scene.dataset.animating='false';scene.dataset.ready='true';
 new ResizeObserver(()=>{
  const next=matchMedia('(max-width:760px)').matches;if(next===narrow)return;narrow=next;resize();
 }).observe(stage);
 new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;if(!visible&&frame)finish();
 },{threshold:.08}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame)finish()});
 new MutationObserver(()=>{if(frame&&(quiet()||document.body.classList.contains('reader-mode')))finish()}).observe(document.body,{attributes:true,attributeFilter:['class']});
}
