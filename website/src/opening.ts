import {gsap} from 'gsap';

/** Each playback owns its scroll lock and restores the existing cover on completion. */
export function initOpening(reduced:boolean,paintPaper:(progress:number)=>void){
 const root=document.documentElement,hero=document.querySelector<HTMLElement>('.hero')!;
 const stage=hero.querySelector<HTMLElement>('#hero-stage')!;
 const skip=document.querySelector<HTMLButtonElement>('#skip-opening')!;
 const replay=document.querySelector<HTMLButtonElement>('#replay-opening')!;
 const footer=hero.querySelector<HTMLElement>('.hero-bottom')!;
 let active=false,playing=false,context:gsap.Context|undefined,timeline:gsap.core.Timeline|undefined,deadline:ReturnType<typeof setTimeout>|undefined;
 let footerExit:gsap.core.Tween|undefined;
 const paper={value:1},locked=new Map<HTMLElement,boolean>();
 const readingTargets='.skip-link,.site-header .brand,#menu-toggle,#reader-toggle,.chapter-rail,.begin-link,#abstract,#exhibition>.chapter:not(.cover),#source-reader';
 function lockReading(){
  document.querySelectorAll<HTMLElement>(readingTargets).forEach(el=>{locked.set(el,el.inert);el.inert=true});
  window.addEventListener('wheel',blockScroll,{passive:false});
  window.addEventListener('touchmove',blockScroll,{passive:false});
  window.addEventListener('scroll',holdCover,{passive:true});
  document.addEventListener('keydown',onKey,true);
  document.addEventListener('click',blockNavigation,true);
 }
 function blockScroll(event:Event){if(!(event instanceof TouchEvent)||event.touches.length===1)event.preventDefault()}
 function holdCover(){if(active&&(scrollY!==0||scrollX!==0))window.scrollTo({top:0,left:0,behavior:'instant'})}
 function blockNavigation(event:MouseEvent){
  const target=event.target instanceof Element?event.target.closest('a,button'):null;
  // The soundtrack control stays usable: the music may already be playing.
  if(target&&target!==skip&&!['motion-toggle','sound-toggle'].includes(target.id)){event.preventDefault();event.stopImmediatePropagation()}
 }
 function finish(){
  const restoreFocus=document.activeElement===skip;
  active=false;playing=false;clearTimeout(deadline);footerExit?.revert();footerExit=undefined;context?.revert();context=undefined;timeline=undefined;
  paper.value=1;paintPaper(1);delete root.dataset.opening;delete root.dataset.openingStarted;
  skip.hidden=true;replay.hidden=false;replay.disabled=reduced;
  locked.forEach((inert,el)=>el.inert=inert);locked.clear();
  window.removeEventListener('wheel',blockScroll);window.removeEventListener('touchmove',blockScroll);
  window.removeEventListener('scroll',holdCover);window.removeEventListener('pagehide',finish);
  document.removeEventListener('click',blockNavigation,true);
  document.removeEventListener('keydown',onKey,true);document.removeEventListener('visibilitychange',onVisibility);
  stage.removeEventListener('paper-ready',start);
  if(restoreFocus)replay.focus({preventScroll:true});
 }
 function start(){
  if(!active||playing)return;playing=true;root.dataset.opening='running';timeline?.play();
  // The soundtrack is cued off the same beat as the timeline; replays re-cue it.
  document.dispatchEvent(new CustomEvent('paper:opening-start',{detail:{at:performance.now()}}));
 }
 function onKey(event:KeyboardEvent){
  if(event.key==='Escape'){event.preventDefault();finish();return}
  if(event.key===' '&&(event.target===skip||['motion-toggle','sound-toggle'].includes((event.target as HTMLElement)?.id)))return;
  if([' ','ArrowDown','ArrowUp','ArrowLeft','ArrowRight','PageDown','PageUp','Home','End'].includes(event.key))event.preventDefault();
 }
 function onVisibility(){if(document.hidden)finish()}
 function setReduced(value:boolean){reduced=value;if(value)finish();replay.disabled=value;replay.title=value?'开启动态效果后可重播开场':'重新播放开场动画'}
 function begin(started=performance.now(),fadeFooter=false){
 if(active||reduced)return;
 if(root.dataset.opening!=='pending')root.style.setProperty('--opening-gutter',innerWidth>root.clientWidth?'stable':'auto');
 active=true;playing=false;root.dataset.opening=fadeFooter?'leaving':'pending';root.dataset.openingStarted=String(started);
 window.scrollTo({top:0,left:0,behavior:'instant'});lockReading();replay.disabled=true;
 // The entire footer fades together, including the control in the former edition slot.
 deadline=setTimeout(finish,Math.max(0,9000-(performance.now()-started)));
 window.addEventListener('pagehide',finish);document.addEventListener('visibilitychange',onVisibility);
 function prepare(){
 footerExit?.revert();footerExit=undefined;
 root.dataset.opening='pending';paper.value=0;paintPaper(0);
 skip.hidden=false;replay.hidden=true;
 const q=(selector:string)=>hero.querySelectorAll(selector);
 context=gsap.context(()=>{
  timeline=gsap.timeline({paused:true,onComplete:finish,defaults:{ease:'power2.inOut'}});
  // Illumination and pose are driven on the real paper surface, not a screen overlay.
  timeline.to(paper,{value:1,duration:6.4,ease:'sine.inOut',onUpdate:()=>paintPaper(paper.value)},0);
  timeline.fromTo(q('#hero-stage'),{opacity:0},{opacity:1,duration:1.8},.15);
  timeline.fromTo(q('.hero-opening-veil'),{opacity:.94},{opacity:0,duration:6.4},0);
  timeline.fromTo(q('.hero-opening-glow'),{opacity:0,xPercent:-18,scaleX:.45},{opacity:.75,xPercent:0,scaleX:1,duration:2.8},.15);
  timeline.to(q('.hero-opening-glow'),{opacity:0,xPercent:18,duration:3.4},2.95);
  const paths=hero.querySelectorAll<SVGPathElement>('.hero-threads path');
  paths.forEach((path,i)=>{
   const length=path.getTotalLength(),direction=path.classList.contains('red-line')?-1:1;
   timeline!.fromTo(path,{strokeDasharray:length,strokeDashoffset:length*direction},{strokeDashoffset:0,duration:4.4,ease:'sine.inOut'},.55+(i%9)*.045);
  });
  timeline.fromTo(q('.hero-orbit'),{opacity:0},{opacity:1,duration:3.8},2);
  timeline.fromTo(q('.hero-title h1>span'),{opacity:0,y:28,clipPath:'inset(0 0 100% 0)'},{opacity:1,y:0,clipPath:'inset(-10% -5% -10% -5%)',duration:2.35,stagger:.8,ease:'power3.out'},2.15);
  timeline.fromTo(q('.hero-title .eyebrow'),{opacity:0},{opacity:1,duration:1.4},3.7);
  timeline.fromTo(q('.hero-title>p'),{opacity:0,y:9},{opacity:1,y:0,duration:1.6},4.9);
  timeline.fromTo(q('.hero-topline'),{opacity:0},{opacity:1,duration:1.6},4.8);
  timeline.fromTo(q('.hero-caption,#hero-stage .stage-coordinate'),{opacity:0},{opacity:1,duration:1.65},5.65);
  timeline.fromTo(q('.hero-bottom'),{opacity:0,y:6},{opacity:1,y:0,duration:1.5},6.3);
 },hero);
 stage.addEventListener('paper-ready',start);
 if(stage.classList.contains('ready')||root.classList.contains('no-webgl'))start();
 if(fadeFooter)skip.focus({preventScroll:true});
 }
 if(fadeFooter)footerExit=gsap.to(footer,{opacity:0,duration:.28,ease:'power2.in',onComplete:prepare});
 else prepare();
 }
 replay.hidden=false;setReduced(reduced);
 skip.addEventListener('click',finish);
 replay.addEventListener('click',()=>begin(performance.now(),true));
 const started=Number(root.dataset.openingStarted)||performance.now();
 if(!reduced&&root.dataset.opening==='pending'&&scrollY<=80&&performance.now()-started<=1500)begin(started);
 else finish();
 return{finish,start,setReduced,progress:()=>paper.value};
}
