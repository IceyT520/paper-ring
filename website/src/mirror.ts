import {shelterGeometry,wingPaths,roofAt,smooth} from './connection-geometry';

/** One click unfolds a shared shelter; neither person's own space is taken away.
 * Geometry is written only during the finite sequence, never in an idle loop. */
export function initMirror(){
 const scene=document.querySelector<HTMLElement>('#mirror-installation')!;
 const $=<T extends Element=HTMLElement>(s:string)=>scene.querySelector<T>(s)!;
 const button=$<HTMLButtonElement>('#connection-meet'),action=$('#shelter-action-text');
 const clip=$<SVGPathElement>('#shelter-rain-boundary'),rain=$<SVGPathElement>('#shelter-rain');
 const splashes=$<SVGPathElement>('#shelter-drops'),common=$<SVGGElement>('#shelter-common');
 const shared=$('#shelter-shared-label'),gap=$('#shelter-gap'),seam=$<SVGPathElement>('#shelter-seam');
 const wings=['blue','red'].map(side=>({
  face:$<SVGPathElement>(`#shelter-${side} .shelter-paper`),fold:$<SVGPathElement>(`#shelter-${side} .shelter-fold`),
  edge:$<SVGPathElement>(`#shelter-${side} .shelter-edge`),crease:$<SVGPathElement>(`#shelter-${side} .shelter-crease`)
 }));
 let progress=0,warmth=0,frame=0,start=0,replay=false,visible=false;
 let paintedProgress=-1,paintedWarmth=-1,rainTime=0,rainStart=0;
 const quiet=()=>document.body.classList.contains('reduced-motion');
 function draw(time:number){
  rainTime=time;
  if(paintedProgress!==progress){
   const g=shelterGeometry(progress);
   [g.left,g.right].forEach((wing,i)=>{
    const paths=wingPaths(wing.outer,wing.tip);
    for(const key of ['face','fold','edge','crease'] as const)wings[i][key].setAttribute('d',paths[key]);
   });
   clip.setAttribute('d',g.rainClip);gap.style.opacity=String(1-smooth(progress/.5));
   paintedProgress=progress;
  }
  if(paintedWarmth!==warmth){
   common.style.opacity=String(warmth);shared.style.opacity=String(warmth);seam.style.opacity=String(warmth);
   paintedWarmth=warmth;
  }
  let drops='',hits='';
  // A fixed set of fine rain strokes. The exact roof polygon clips each stroke;
  // splashes are placed on that same top edge, never inside the protected space.
  for(let i=0;i<46;i++){
   const x=67+(i*137)%970,y=((i*79+time*.13)%600)-25,len=12+i%4*4;
   drops+=`M${x} ${y.toFixed(1)}v${len}`;
   const roof=roofAt(x,progress);
   if(roof!==null&&y>roof-10&&y<roof+30){
    const t=(y-roof+10)/40,r=2+t*7;
    hits+=`M${x-r} ${(roof-2-Math.sin(t*Math.PI)*3).toFixed(1)}q${r} -3 ${r*2} 0`;
   }
  }
  rain.setAttribute('d',drops);splashes.setAttribute('d',hits);
 }
 function finish(){
  cancelAnimationFrame(frame);frame=0;progress=1;warmth=1;draw(rainTime);
  scene.dataset.connected='true';scene.dataset.animating='false';button.setAttribute('aria-busy','false');
  button.setAttribute('aria-label','再看一次：保留各自的空间，共同撑起一片挡雨的屋檐');
  action.textContent='再次轻触，重看一次';
  $('#shelter-status').textContent='各自自在，也能一起避雨';
 }
 function tick(now:number){
  frame=0;
  if(!visible||document.hidden||quiet()||document.body.classList.contains('reader-mode')){finish();return}
  if(!start)start=now;
  const elapsed=now-start,offset=replay?750:0,t=elapsed-offset;
  if(replay&&elapsed<750){progress=1-smooth(elapsed/750);warmth=1-smooth(elapsed/450)}
  else{progress=smooth((t-450)/2500);warmth=smooth((t-2950)/1100)}
  draw(rainStart+elapsed);
  if(t>=5700){finish();return}
  frame=requestAnimationFrame(tick);
 }
 button.disabled=false;button.addEventListener('click',()=>{
  if(frame)return;
  replay=progress===1;start=0;rainStart=rainTime;scene.dataset.animating='true';button.setAttribute('aria-busy','true');
  action.textContent='把中间，变成可以安心停留的地方';
  if(quiet()||!visible||document.hidden){finish();return}
  frame=requestAnimationFrame(tick);
 });
 draw(0);scene.dataset.animating='false';scene.dataset.ready='true';
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frame)finish()},{threshold:.1}).observe(button);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame)finish()});
 new MutationObserver(()=>{if(frame&&(quiet()||document.body.classList.contains('reader-mode')))finish()}).observe(document.body,{attributes:true,attributeFilter:['class']});
}
