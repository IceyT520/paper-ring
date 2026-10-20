/** A single folded sheet: opposing protective gestures conceal a shared need.
 *  Only this controller owns its geometry. Rendering sleeps when settled,
 *  offscreen, in the reader, or in a background tab. */
export function initMirror(){
 const scene=document.querySelector<HTMLElement>('#mirror-installation')!;
 const knot=scene.querySelector<HTMLButtonElement>('#mirror-knot')!;
 const status=scene.querySelector<HTMLElement>('#mirror-status')!;
 const hint=scene.querySelector<HTMLElement>('#mirror-hint')!;
 const reset=scene.querySelector<HTMLButtonElement>('#mirror-reset')!;
 const voices=[...scene.querySelectorAll<HTMLButtonElement>('[data-mirror-side]')];
 const ribbons=[...scene.querySelectorAll<SVGPathElement>('.tension-ribbon')];
 const creases=[...scene.querySelectorAll<SVGPathElement>('.tension-crease')];
 const threads=[...scene.querySelectorAll<SVGPathElement>('.tension-thread')];
 const signals=[...scene.querySelectorAll<SVGPathElement>('.tension-signal')];
 const quiet=()=>document.body.classList.contains('reduced-motion');
 let open=0,pull=0,targetOpen=0,targetPull=0,velocityOpen=0,velocityPull=0;
 let frame=0,lastTime=0,visible=false,entered=false,dragging=false,pointer=-1,startX=0,startY=0;
 let dragged=false,suppressClick=false,measureWidth=1000;
 let beforeDragOpen=false,beforeDragPull=0;
 const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
 const f=(n:number)=>n.toFixed(2);

 // Two curved boundaries describe every fold. Matching boundaries prevent
 // cracks between facets; both sides remain parts of the same sheet.
 function curve(level:number,side:number){
  const edge=320+side*(29+level*151);
  const neck=320+side*((3+level*17)*(1-open)+(77+level*48)*open);
  const center=500+pull*100*(1-open*.55);
  const flare=Math.sin(level*Math.PI)*19;
  const x=98+level*level*47;
  const arch=side*(18+flare)*(1-open);
  return {x,edge,neck,center,arch};
 }
 function segment(level:number,side:number,back=false){
  const {x,edge,neck,center,arch}=curve(level,side);
  if(back)return `L${f(1000-x)},${f(edge)} C${f(780+pull*16)},${f(edge+arch)} ${f(center+98)},${f(neck)} ${f(center)},${f(neck)} C${f(center-98)},${f(neck)} ${f(220+pull*16)},${f(edge+arch)} ${f(x)},${f(edge)}`;
  return `M${f(x)},${f(edge)} C${f(220+pull*16)},${f(edge+arch)} ${f(center-98)},${f(neck)} ${f(center)},${f(neck)} C${f(center+98)},${f(neck)} ${f(780+pull*16)},${f(edge+arch)} ${f(1000-x)},${f(edge)}`;
 }
 function paint(){
  for(let i=0;i<ribbons.length;i++){
   const side=i<12?-1:1,index=i%12;
   ribbons[i].setAttribute('d',segment(index/12,side)+segment((index+1)/12,side,true)+'Z');
   creases[i].setAttribute('d',segment(index/12,side));
  }
  threads.forEach((path,i)=>{
   const d=segment(.04,i===0?-1:1);path.setAttribute('d',d);signals[i].setAttribute('d',d);
  });
  // Variables are local to the installation, never inherited by the article.
  scene.style.setProperty('--mirror-open',f(open));
  scene.style.setProperty('--mirror-pull',f(pull));
  scene.style.setProperty('--mirror-tension',f(1-open+Math.abs(pull)*.5));
  knot.style.transform=`translate(calc(-50% + ${f(pull*(1-open*.55)*10)}cqw),-50%)`;
 }
 function settle(){
  cancelAnimationFrame(frame);frame=0;lastTime=0;
  open=targetOpen;pull=targetPull;velocityOpen=velocityPull=0;
  scene.dataset.animating='false';paint();
 }
 function tick(now:number){
  frame=0;
  if(!visible||document.hidden||quiet()){settle();return}
  const dt=Math.min((now-(lastTime||now-16.67))/1000,1/30);lastTime=now;
  // Overdamped opening, lightly elastic lateral tension; independent of FPS.
  velocityOpen+=((targetOpen-open)*64-velocityOpen*16)*dt;
  velocityPull+=((targetPull-pull)*104-velocityPull*19)*dt;
  open=clamp(open+velocityOpen*dt,0,1);pull=clamp(pull+velocityPull*dt,-1.15,1.15);
  paint();
  if(Math.abs(open-targetOpen)+Math.abs(pull-targetPull)+Math.abs(velocityOpen)+Math.abs(velocityPull)<.003){settle();return}
  frame=requestAnimationFrame(tick);
 }
 function animate(){
  if(quiet()||!visible||document.hidden){settle();return}
  scene.dataset.animating='true';
  if(!frame){lastTime=0;frame=requestAnimationFrame(tick)}
 }
 function choose(nextOpen:boolean,bias=0,holding=false){
  targetOpen=nextOpen?1:0;targetPull=bias;
  scene.dataset.state=holding?'pulling':nextOpen?'open':'taut';
  scene.dataset.side=bias<-.1?'left':bias>.1?'right':'both';
  knot.setAttribute('aria-pressed',String(nextOpen));
  knot.setAttribute('aria-label',nextOpen?'重新感受两边的拉扯':'松开拉扯，看见共同的需要');
  voices.forEach(b=>b.setAttribute('aria-pressed',String(!nextOpen&&Number(b.dataset.mirrorSide)===Math.sign(bias))));
  status.textContent=nextOpen?'方向不同，想要的都是安全的联结':bias<-.1?'「给我一点空间」—— 我想靠近，也想保有自己':bias>.1?'「别离开我」—— 我想确认，你依然在这里':'一个怕失去自己，一个怕失去你';
  hint.textContent=nextOpen?'看见需要，是理解彼此的开始':'拖动中央的结，松手看见内里 · 也可以轻触';
  animate();
 }
 knot.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  entered=true;dragging=true;dragged=false;suppressClick=false;pointer=event.pointerId;
  beforeDragOpen=targetOpen>.5;beforeDragPull=targetPull;
  startX=event.clientX;startY=event.clientY;measureWidth=scene.getBoundingClientRect().width;
  knot.setPointerCapture(pointer);
 });
 knot.addEventListener('pointermove',event=>{
  if(!dragging||event.pointerId!==pointer)return;
  const dx=event.clientX-startX,dy=event.clientY-startY;
  // Let a vertical touch gesture keep its normal page scrolling.
  if(!dragged&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>9){cancelDrag();return}
  if(!dragged&&Math.abs(dx)<5)return;
  if(!dragged){
   dragged=true;scene.dataset.state='pulling';targetOpen=0;
   knot.setAttribute('aria-pressed','false');knot.setAttribute('aria-label','松开拉扯，看见共同的需要');
   voices.forEach(button=>button.setAttribute('aria-pressed','false'));
   status.textContent='越是用力拉扯，越难看见彼此的需要';
   hint.textContent='松开手，看看拉扯背后藏着什么';
  }
  targetPull=clamp(dx/(measureWidth*.2),-1,1);
  scene.dataset.side=targetPull<-.1?'left':targetPull>.1?'right':'both';animate();
 });
 function releaseCapture(){if(knot.hasPointerCapture(pointer))knot.releasePointerCapture(pointer)}
 function cancelDrag(){
  if(!dragging)return;
  dragging=false;suppressClick=true;releaseCapture();choose(beforeDragOpen,beforeDragPull);
 }
 function release(event:PointerEvent){
  if(!dragging||event.pointerId!==pointer)return;
  dragging=false;releaseCapture();
  if(dragged){suppressClick=true;choose(true)}
 }
 knot.addEventListener('pointerup',release);
 knot.addEventListener('pointercancel',cancelDrag);
 knot.addEventListener('lostpointercapture',()=>{if(dragging)cancelDrag()});
 knot.addEventListener('click',event=>{
  if(suppressClick&&event.detail!==0){suppressClick=false;return}
  suppressClick=false;entered=true;choose(targetOpen<.5);
 });
 knot.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();entered=true;choose(false,event.key==='ArrowLeft'?-.9:.9);
  }else if(event.key==='Escape'){event.preventDefault();cancelDrag();choose(false)}
 });
 voices.forEach(button=>button.addEventListener('click',()=>{entered=true;choose(false,Number(button.dataset.mirrorSide)*.9)}));
 reset.addEventListener('click',()=>{entered=true;cancelDrag();choose(false)});
 new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  scene.dataset.visible=String(visible&&!document.hidden);
  if(!visible){if(dragging)cancelDrag();settle();return}
  // A single fold-in entrance gives the static sheet depth without an idle loop.
  if(!entered&&!quiet()){entered=true;open=.35;pull=-.2;animate()}
 },{threshold:.08}).observe(scene);
 document.addEventListener('visibilitychange',()=>{
  scene.dataset.visible=String(visible&&!document.hidden);
  if(document.hidden){if(dragging)cancelDrag();settle()}
 });
 new MutationObserver(()=>{if(quiet()||document.body.classList.contains('reader-mode')){if(dragging)cancelDrag();settle()}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 choose(false);
}
