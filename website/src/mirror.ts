import {fadeText} from './text-motion';
import {shelterGeometry,wingPaths,roofAt,smooth} from './connection-geometry';

/** Unfolding is finite. Weather continues only while this installation is visible;
 * the settled paper geometry and text are never rewritten by the weather loop. */
export function initMirror(){
 const scene=document.querySelector<HTMLElement>('#mirror-installation')!;
 const $=<T extends Element=HTMLElement>(s:string)=>scene.querySelector<T>(s)!;
 const button=$<HTMLButtonElement>('#connection-meet'),action=$('#shelter-action-text');
 const clip=$<SVGPathElement>('#shelter-rain-boundary'),rain=$<SVGPathElement>('#shelter-rain');
 const farRain=$<SVGPathElement>('#shelter-rain-far'),splashes=$<SVGPathElement>('#shelter-drops');
 const runnels=$<SVGPathElement>('#shelter-runnels'),drips=$<SVGPathElement>('#shelter-drips'),ripples=[...scene.querySelectorAll<SVGPathElement>('#shelter-ripples path')];
 const common=$<SVGGElement>('#shelter-common'),shared=$('#shelter-shared-label'),gap=$('#shelter-gap'),seam=$<SVGPathElement>('#shelter-seam');
 const wings=['blue','red'].map(side=>({
  face:$<SVGPathElement>(`#shelter-${side} .shelter-paper`),fold:$<SVGPathElement>(`#shelter-${side} .shelter-fold`),
  edge:$<SVGPathElement>(`#shelter-${side} .shelter-edge`),crease:$<SVGPathElement>(`#shelter-${side} .shelter-crease`),
  grain:$<SVGPathElement>(`#shelter-${side} .shelter-grain`),memory:$<SVGPathElement>(`#shelter-${side} .shelter-memory`)
 }));
 let progress=0,warmth=0,frame=0,lastFrame=0,elapsed=0,replay=false,visible=false,transitioning=false;
 let paintedProgress=-1,paintedWarmth=-1,weatherTime=0;
 const quiet=()=>document.body.classList.contains('reduced-motion');
 const canRun=()=>visible&&!document.hidden&&!quiet()&&!document.body.classList.contains('reader-mode');
 function drawStructure(){
  if(paintedProgress!==progress){
   const g=shelterGeometry(progress);
   [g.left,g.right].forEach((wing,i)=>{
    const paths=wingPaths(wing.outer,wing.tip);
    for(const key of ['face','fold','edge','crease','grain','memory'] as const)wings[i][key].setAttribute('d',paths[key]);
   });
   clip.setAttribute('d',g.rainClip);gap.style.opacity=String(1-smooth(progress/.5));
   paintedProgress=progress;
  }
  if(paintedWarmth!==warmth){
   common.style.opacity=String(warmth);shared.style.opacity=String(warmth);seam.style.opacity=String(warmth);
   paintedWarmth=warmth;
  }
 }
 const f=(v:number)=>v.toFixed(1);
 function drawWeather(){
  let drops='',distant='',hits='',streams='',falling='';
  const rings=[{d:'',opacity:0},{d:'',opacity:0}];
  for(let i=0;i<44;i++){
   const x=67+(i*137)%970,y=((i*79+weatherTime*.13)%600)-25,len=12+i%4*4;
   drops+=`M${x} ${f(y)}v${len}`;
   const roof=roofAt(x,progress);
   if(roof!==null&&y>roof-10&&y<roof+30){
    const t=(y-roof+10)/40,r=2+t*7;
    hits+=`M${f(x-r)} ${f(roof-2-Math.sin(t*Math.PI)*3)}q${f(r)} -3 ${f(r*2)} 0`;
   }
  }
  for(let i=0;i<28;i++){
   const x=45+(i*183)%1010,y=((i*111+weatherTime*.085)%600)-20;
   distant+=`M${x} ${f(y)}v${8+i%3*3}`;
  }
  const g=shelterGeometry(progress);
  for(const [side,wing] of [g.left,g.right].entries()){
   // A few fine highlights travel down the actual top face toward its eave.
   for(let i=0;i<4;i++){
    const t=.08+((weatherTime/3000+i*.23+side*.31)%1)*.82;
    const x=wing.tip.x+(wing.outer.x-wing.tip.x)*t;
    const x2=wing.tip.x+(wing.outer.x-wing.tip.x)*(t+.045);
    streams+=`M${f(x)} ${f(roofAt(x,progress)!+4)}L${f(x2)} ${f(roofAt(x2,progress)!+4)}`;
   }
   // Runoff falls outside the eave; it never crosses a private or shared area.
   const direction=side?1:-1,phase=(weatherTime/1900+side*.47)%1;
   const x=wing.outer.x,groundX=x+direction*14;
   if(phase<.63){
    const t=phase/.63,y=260+258*t*t,dx=direction*14*t;
    falling+=`M${f(x+dx)} ${f(y)}l${f(direction*1.2)} ${f(3+t*9)}`;
   }else{
    const t=(phase-.63)/.37,rx=4+t*22,ry=1+t*4;
    rings[side]={d:`M${f(groundX-rx)} 518a${f(rx)} ${f(ry)} 0 1 0 ${f(rx*2)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-rx*2)} 0`,opacity:1-t};
   }
  }
  rain.setAttribute('d',drops);farRain.setAttribute('d',distant);splashes.setAttribute('d',hits);
  runnels.setAttribute('d',streams);drips.setAttribute('d',falling);
  ripples.forEach((ring,i)=>{ring.setAttribute('d',rings[i].d);ring.style.opacity=String(rings[i].opacity)});
 }
 function finish(){
  transitioning=false;progress=1;warmth=1;drawStructure();
  scene.dataset.connected='true';scene.dataset.animating='false';button.setAttribute('aria-busy','false');
  button.setAttribute('aria-label','再看一次：保留各自的空间，共同撑起一片挡雨的屋檐');
  fadeText(action,'再次轻触，重看一次');fadeText($('#shelter-status'),'各自自在，也能一起避雨');
 }
 function tick(now:number){
  frame=0;
  if(!canRun()){sync();return}
  const dt=lastFrame?Math.min(now-lastFrame,64):0;lastFrame=now;weatherTime+=dt;
  if(transitioning){
   elapsed+=dt;const offset=replay?750:0,t=elapsed-offset;
   if(replay&&elapsed<750){progress=1-smooth(elapsed/750);warmth=1-smooth(elapsed/450)}
   else{progress=smooth((t-450)/2500);warmth=smooth((t-2950)/1100)}
   drawStructure();if(t>=5700)finish();
  }
  drawWeather();frame=requestAnimationFrame(tick);
 }
 function sync(){
  const active=canRun(),state=active?'running':'paused';
  if(scene.dataset.weather!==state)scene.dataset.weather=state;
  if(active){if(!frame){lastFrame=0;frame=requestAnimationFrame(tick)}}
  else{
   cancelAnimationFrame(frame);frame=0;lastFrame=0;
   if(transitioning){finish();drawWeather()}
  }
 }
 button.disabled=false;button.addEventListener('click',()=>{
  if(transitioning)return;
  replay=progress===1;elapsed=0;transitioning=true;scene.dataset.animating='true';button.setAttribute('aria-busy','true');
  fadeText(action,'把中间，变成可以安心停留的地方');
  sync();
 });
 drawStructure();drawWeather();scene.dataset.animating='false';scene.dataset.ready='true';scene.dataset.weather='paused';
 new IntersectionObserver(entries=>{
  // A callback can contain several queued transitions for the same target.
  let latest:IntersectionObserverEntry|undefined;
  for(const entry of entries)if(entry.target===button&&(!latest||entry.time>=latest.time))latest=entry;
  if(!latest)return;
  visible=latest.isIntersecting&&latest.intersectionRatio>=.1;sync();
 },{threshold:.1}).observe(button);
 document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
}
