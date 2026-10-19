import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {initSimulator} from './simulator';
import {initJourney,updateAtmosphere} from './touch';
import {initOpticalTitles} from './typography';
import {initOpening} from './opening';
import {initAudio} from './audio';
import {initGate} from './gate';
import type {PaperController} from './paper';
gsap.registerPlugin(ScrollTrigger);

const $=<T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const all=<T extends Element=HTMLElement>(selector:string)=>[...document.querySelectorAll<T>(selector)];
const storage={get(key:string){try{return localStorage.getItem(key)}catch{return null}},set(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* Reading remains available when storage is disabled. */}}};
const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=storage.get('paper-motion')===null?media.matches:storage.get('paper-motion')==='reduced';
let readerMode=false,currentSource='p001',currentChapter='01',paper:PaperController|undefined;
// Audio listens before the opening can fire its first cue.
initAudio();
// Deep links, back/forward and ?nogate skip the envelope gate.
const gateEnabled=!location.hash&&!location.search.includes('nogate')&&(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined)?.type!=='back_forward';
const opening=initOpening(reduced,progress=>paper?.setOpening(progress),{defer:gateEnabled});
const gate=gateEnabled?initGate(reduced):undefined;
if(gate?.active)gate.onOpen(()=>opening.begin());
else if(gateEnabled)opening.begin();
let context:gsap.Context|undefined,toastTimer:ReturnType<typeof setTimeout>;
const chapterEls=all<HTMLElement>('#exhibition > .chapter');
const menu=$<HTMLDialogElement>('#chapter-menu');
try{localStorage.removeItem('paper-bookmark')}catch{/* Discard the retired bookmark when storage is available. */}
function toast(text:string){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800)}
function scrollToElement(el:HTMLElement,behavior:ScrollBehavior=reduced?'instant':'smooth'){
 const top=el.getBoundingClientRect().top+scrollY-110;window.scrollTo({top:Math.max(0,top),behavior});
}
function closeMenu(){menu.close();}
$('#menu-toggle').addEventListener('click',()=>{if(menu.open)closeMenu();else{menu.showModal();$('#menu-toggle').setAttribute('aria-expanded','true');document.body.style.overflow='hidden'}});
$('#menu-close').addEventListener('click',closeMenu);
menu.addEventListener('close',()=>{$('#menu-toggle').setAttribute('aria-expanded','false');document.body.style.overflow=''});
all<HTMLAnchorElement>('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const id=a.hash.slice(1),target=document.getElementById(id);if(!target)return;
 e.preventDefault();if(menu.open)closeMenu();
 if(readerMode&&!target.closest('#source-reader'))setReader(false,currentSource,false);
 if(target instanceof HTMLDetailsElement)target.open=true;
 scrollToElement(target);history.replaceState(null,'',`#${id}`);
}));

function setReader(next:boolean,id=currentSource,move=true){
 opening.finish();
 readerMode=next;$('#exhibition').hidden=next;$('#source-reader').hidden=!next;document.body.classList.toggle('reader-mode',next);
 if(next)setMobiusLock(false);
 $('#reader-toggle').innerHTML=next?'回到展览 <span aria-hidden="true">↗</span>':'阅读全文 <span aria-hidden="true">↗</span>';
 $('#reader-toggle').setAttribute('aria-pressed',String(next));
 const target=document.getElementById(`${next?'reader-':''}${id}`);
 ScrollTrigger.refresh();paper?.refresh();
 if(move&&target){scrollToElement(target,'instant');target.classList.remove('located');requestAnimationFrame(()=>target.classList.add('located'))}
 ScrollTrigger.update();updateProgress();
}
$('#reader-toggle').addEventListener('click',()=>setReader(!readerMode));
$('#return-exhibition').addEventListener('click',()=>setReader(false));
all<HTMLButtonElement>('[data-open-reader]').forEach(b=>b.addEventListener('click',()=>setReader(true,'p001')));
all<HTMLButtonElement>('[data-locate]').forEach(b=>b.addEventListener('click',()=>{currentSource=b.dataset.locate!;setReader(!readerMode,currentSource)}));

const sourceObserver=new IntersectionObserver(entries=>{
 const shown=entries.filter(e=>e.isIntersecting&&!e.target.closest('[hidden]')).sort((a,b)=>Math.abs(a.boundingClientRect.top-innerHeight*.3)-Math.abs(b.boundingClientRect.top-innerHeight*.3));
 if(!shown.length)return;
 currentSource=(shown[0].target as HTMLElement).dataset.sourceId!;
},{rootMargin:'-16% 0px -45% 0px',threshold:0});
all('.source-block').forEach(el=>sourceObserver.observe(el));

const railLinks=all<HTMLAnchorElement>('[data-rail]'),progressBar=$('.reading-progress span'),header=$('.site-header');
let markedChapter='',chapterBounds:{el:HTMLElement;top:number;bottom:number}[]=[],pageHeight=1;
function measureChapters(){
 pageHeight=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 chapterBounds=chapterEls.map(el=>{const r=el.getBoundingClientRect();return{el,top:r.top+scrollY,bottom:r.bottom+scrollY}});
}
function updateProgress(){
 progressBar.style.transform=`scaleX(${Math.min(1,scrollY/pageHeight)})`;
 if(readerMode){header.classList.add('on-paper');return}
 const at=scrollY+innerHeight*.4;
 const active=chapterBounds.find(item=>item.top<=at&&item.bottom>at);
 if(active){
   currentChapter=active.el.dataset.chapter!;
   if(markedChapter!==currentChapter){markedChapter=currentChapter;railLinks.forEach(a=>{if(a.dataset.rail===currentChapter)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
   header.classList.remove('on-paper');
   updateAtmosphere(Number(currentChapter),Math.max(0,Math.min(1,(at-active.top)/(active.bottom-active.top))));
 }
 updateMobiusLock();
}
let scrollTick=false;
addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(()=>{updateProgress();scrollTick=false})}},{passive:true});
ScrollTrigger.addEventListener('refresh',measureChapters);
addEventListener('resize',()=>{measureChapters();updateProgress()});
new ResizeObserver(measureChapters).observe(document.body);

const twistCopy=[
 ['01 / 打开接缝','先让惯性的追逐与退缩，停在这里。打开接缝，也是在为另一种可能留下空间。'],
 ['02 / 将一端扭转半圈','改变观察的角度。试着看见：沉默里的害怕，和追问背后的需要。'],
 ['03 / 重新连接，同一个面','沿着这张纸继续走，会经过曾经的另一面。理解，让两个世界有了连续的路径。']
];
let twistTween:gsap.core.Tween|undefined;
let tracePaused=false;
let twistIndex=-1,paintedTwist=-1;
function paintTwist(value:number){
 if(document.documentElement.classList.contains('no-webgl'))value=1;
 paper?.setTwist(value);
 if(paintedTwist!==value){paintedTwist=value;$('.twist-progress i').style.transform=`scaleX(${value})`;$('.mobius-aura').style.opacity=String(.4+value*.6)}
 if(value>=.999)setMobiusLock(false);
 const index=value<.2?0:value<.8?1:2;
 if(index===twistIndex)return;twistIndex=index;
 $('#twist-caption').textContent=twistCopy[index][0];$('#twist-description').textContent=twistCopy[index][1];
 all<HTMLButtonElement>('[data-twist-step]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
}
/** The Möbius act gates the page: until the two sides reconnect, scrolling
 *  down is refused (scrolling back up still works, so nobody is trapped). */
let mobiusLocked=false,mobiusTouchY=0;
function pulseMobius(){
 const button=document.getElementById('replay-twist');if(!button)return;
 button.classList.remove('nudge');void (button as HTMLElement).offsetWidth;button.classList.add('nudge');
 setTimeout(()=>button.classList.remove('nudge'),2000);
}
function blockMobiusWheel(event:WheelEvent){if(event.deltaY<=0)return;event.preventDefault();pulseMobius()}
function blockMobiusKeys(event:KeyboardEvent){
 const typing=(event.target as HTMLElement)?.tagName==='BUTTON';
 if(['ArrowDown','PageDown','End'].includes(event.key)||(event.key===' '&&!typing)){event.preventDefault();pulseMobius()}
}
function blockMobiusTouchStart(event:TouchEvent){mobiusTouchY=event.touches[0]?.clientY??0}
function blockMobiusTouch(event:TouchEvent){const y=event.touches[0]?.clientY??0;if(y<mobiusTouchY-2){event.preventDefault();pulseMobius()}}
function setMobiusLock(on:boolean){
 if(on===mobiusLocked)return;mobiusLocked=on;
 if(on){
  document.documentElement.dataset.mobiusLock='1';
  addEventListener('wheel',blockMobiusWheel,{passive:false});
  addEventListener('touchstart',blockMobiusTouchStart,{passive:true});
  addEventListener('touchmove',blockMobiusTouch,{passive:false});
  addEventListener('keydown',blockMobiusKeys,true);
 }else{
  delete document.documentElement.dataset.mobiusLock;
  removeEventListener('wheel',blockMobiusWheel);
  removeEventListener('touchstart',blockMobiusTouchStart);
  removeEventListener('touchmove',blockMobiusTouch);
  removeEventListener('keydown',blockMobiusKeys,true);
 }
}
function updateMobiusLock(){
 if(reduced||paintedTwist>=1){setMobiusLock(false);return}
 const section=document.getElementById('mobius-section');
 if(!section){setMobiusLock(false);return}
 const box=section.getBoundingClientRect();
 setMobiusLock(box.top<=innerHeight*.24&&box.bottom>innerHeight*.58);
}
function stopTwist(){
 twistTween?.kill();twistTween=undefined;
 const pause=$<HTMLButtonElement>('#pause-twist');pause.disabled=true;pause.setAttribute('aria-pressed','false');pause.textContent='暂停形变';
}
function animateTwist(value:number,duration:number,onComplete?:()=>void){
 stopTwist();
 if(reduced){paintTwist(value);onComplete?.();return}
 const progress={value:Math.max(0,paintedTwist)};
 $<HTMLButtonElement>('#pause-twist').disabled=false;
 twistTween=gsap.to(progress,{value,duration,ease:'sine.inOut',onUpdate:()=>paintTwist(progress.value),onComplete:()=>{stopTwist();onComplete?.()}});
}
function setupMotion(){
 opening.setReduced(reduced);
 stopTwist();
 context?.revert();document.body.classList.toggle('reduced-motion',reduced);
 $('#motion-toggle').setAttribute('aria-pressed',String(reduced));
 $('#motion-toggle').setAttribute('aria-label',reduced?'开启动态效果':'减少动态效果');
 $('.motion-label').textContent=reduced?'静态':'动态';paper?.setReduced(reduced);
 paintTwist(paintedTwist<0?(reduced?1:0):paintedTwist);
 updateMobiusLock();
 if(reduced){ScrollTrigger.refresh();paper?.refresh();return}
 context=gsap.context(()=>{
   all<HTMLElement>('.chapter-heading h2,.large-quote').filter(el=>!el.closest('#chapter-10')).forEach(el=>{
     gsap.from(el,{y:35,opacity:.25,duration:1.25,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',toggleActions:'play none none reverse'}});
   });
   gsap.from('.letter-sheet',{rotationX:-9,y:65,transformPerspective:1000,ease:'none',scrollTrigger:{trigger:'.abstract-section',start:'top 90%',end:'top 25%',scrub:1}});
   gsap.to('.waiting-wire',{scaleY:1.9,ease:'none',scrollTrigger:{trigger:'#chapter-02',start:'top top',end:'60% center',scrub:1}});
   all<HTMLElement>('.bubble-cloud span').forEach((el,i)=>gsap.fromTo(el,{y:35,opacity:.04},{y:-30,opacity:innerWidth<760?.11:.4,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom 15%',scrub:1}}));
   gsap.from('.peel-card',{rotation:-3,y:40,scrollTrigger:{trigger:'.peel-installation',start:'top 85%',end:'top 40%',scrub:1}});
   // Reveal each complete illustration once: no per-path repaint on every scroll.
   all<HTMLElement>('.flow-study>.narrative-svg').forEach(art=>gsap.from(art,{opacity:.15,y:22,duration:1.2,ease:'power2.out',scrollTrigger:{trigger:art,start:'top 92%',once:true}}));
   gsap.to('.signal-lines i',{opacity:.12,scaleX:.7,ease:'none',scrollTrigger:{trigger:'#distance-1',start:'top center',end:'bottom center',scrub:1}});
   const replyScene=gsap.timeline({scrollTrigger:{trigger:'#chapter-11 .waiting-scene',start:'top 75%',toggleActions:'play none none reverse'}});
   replyScene.from('.screen-glow',{opacity:0,duration:2,ease:'sine.inOut'},0)
    .from('.message-reply',{opacity:0,y:12,duration:1.2,ease:'power2.out'},.9);
   all<HTMLElement>('.dedication-copy .source-block').forEach(el=>gsap.from(el,{opacity:.2,y:15,duration:1,scrollTrigger:{trigger:el,start:'top 92%',toggleActions:'play none none reverse'}}));
 });
 ScrollTrigger.refresh();
}
$('#motion-toggle').addEventListener('click',()=>{reduced=!reduced;storage.set('paper-motion',reduced?'reduced':'full');setupMotion();toast(reduced?'已减少动态效果，全部内容保持可读。':'动态效果已开启。')});
media.addEventListener('change',()=>{if(storage.get('paper-motion')===null){reduced=media.matches;setupMotion()}});
$('#funding-note').addEventListener('click',e=>{const b=e.currentTarget as HTMLButtonElement;b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))});
$('#flip-ring').addEventListener('click',()=>{if(paper)paper.flip();else toast('纸环示意暂以静态呈现，正文可继续阅读。')});

const peelLines=['为什么不回消息？','我很害怕，我需要你。','求你拉住我，别推我走。'];let peelIndex=0;
$('#peel-button').addEventListener('click',()=>{peelIndex=(peelIndex+1)%3;$('#peel-text').textContent=peelLines[peelIndex];$('#peel-number').textContent=`0${peelIndex+1} / 03`;$('#peel-button').innerHTML=(peelIndex===2?'再听一次':'听见更深一层')+' <span aria-hidden="true">↗</span>';if(!reduced)gsap.fromTo('#peel-text',{opacity:0,y:10},{opacity:1,y:0,duration:.65})});
const mirror=$<HTMLInputElement>('#mirror-range');
mirror.addEventListener('input',()=>{$('#mirror-installation').style.setProperty('--mirror',mirror.value);$('#mirror-installation').classList.toggle('aligned',Math.abs(Number(mirror.value)-50)<15)});
let mirrorDragging=false;
$('.mirror-fold').addEventListener('pointerdown',e=>{mirrorDragging=true;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)});
$('.mirror-fold').addEventListener('pointermove',e=>{if(!mirrorDragging)return;const rect=$('#mirror-installation').getBoundingClientRect();mirror.value=String(Math.max(0,Math.min(100,((e.clientX-rect.left)/rect.width-.35)/.3*100)));mirror.dispatchEvent(new Event('input'))});
$('.mirror-fold').addEventListener('pointerup',()=>mirrorDragging=false);
$('.mirror-fold').addEventListener('pointercancel',()=>mirrorDragging=false);
$('#paper-coin').addEventListener('click',()=>$('#paper-coin').classList.toggle('flipped'));
$('#filter-toggle').addEventListener('click',()=>{const on=$('.filter-demo').classList.toggle('unfiltered');$('#filter-toggle').setAttribute('aria-pressed',String(on));$('#filter-toggle').innerHTML=(on?'重新看见恐惧的解释':'揭开恐惧的滤镜')+' <span aria-hidden="true">↗</span>'});
let pursuit=0;
$('#pursue').addEventListener('click',()=>{pursuit++;$('#pursuit-count').textContent=`第 ${pursuit} 次追问`;$('#retreat-box').style.transform=`scaleX(${Math.max(.52,1-pursuit*.065)})`;$('#retreat-box').style.boxShadow=`inset ${Math.min(60,12+pursuit*4)}px 0 30px #0009`;if(!reduced){const wave=document.createElement('i');wave.className='pulse-wave';$('#pulse-road').append(wave);setTimeout(()=>wave.remove(),1600)}});
$('#pursue-reset').addEventListener('click',()=>{pursuit=0;$('#pursuit-count').textContent='尚未追问';$('#retreat-box').style.transform='';$('#retreat-box').style.boxShadow='';$('#pulse-road').replaceChildren()});
const subtitles=[['我在努力靠近你','你在挤压我的空间'],['我需要确认你没有离开','你在剥夺我的自由'],['我想进入你的世界','你在摧毁我的边界']];
all<HTMLButtonElement>('[data-subtitle]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.subtitle);$('#subtitle-anx').textContent=subtitles[i][0];$('#subtitle-avd').textContent=subtitles[i][1];$('.subtitle-action').textContent=['靠近','确认','进入'][i];all<HTMLButtonElement>('[data-subtitle]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
const loopDescriptions=['因距离而不安，想要确认对方还在。','增加联系频率，表达更多需求。','对方感到压力，开始想要逃离。','减少联系，以疏离保护自己的空间。','沉默被理解为即将失去，不安加剧。','更加急切地追问，又成为对方退缩的新理由。'];
let loopStep=-1,loopRounds=0,loopTimer:ReturnType<typeof setInterval>|undefined;
function unveilDistance(){$('#distance-shield').classList.add('unveiled');$('#unveil-distance').setAttribute('aria-expanded','true')}
$('#unveil-distance').addEventListener('click',unveilDistance);
$('#loop-play').addEventListener('click',unveilDistance);
$('#loop-next').addEventListener('click',unveilDistance);
function stopLoop(){if(loopTimer)clearInterval(loopTimer);loopTimer=undefined;$('#loop-play').innerHTML='播放一轮 <span aria-hidden="true">↗</span>'}
function nextLoop(){loopStep=(loopStep+1)%6;if(loopStep===5)loopRounds++;$('#loop-count').textContent=String(loopRounds).padStart(2,'0');$('#loop-description').textContent=loopDescriptions[loopStep];all<HTMLElement>('[data-loop-node]').forEach((el,i)=>{el.classList.toggle('active',i===loopStep);el.classList.toggle('visited',i<=loopStep)});if(loopStep===5)stopLoop()}
$('#loop-next').addEventListener('click',()=>{stopLoop();nextLoop()});
$('#loop-play').addEventListener('click',()=>{if(loopTimer){stopLoop();return}if(loopStep===5)loopStep=-1;nextLoop();if(loopStep!==5){loopTimer=setInterval(nextLoop,reduced?1800:1200);$('#loop-play').innerHTML='暂停 <span aria-hidden="true">Ⅱ</span>'}});
$('#loop-reset').addEventListener('click',()=>{stopLoop();loopStep=-1;loopRounds=0;$('#loop-count').textContent='00';$('#loop-description').textContent='焦虑因距离而起。一轮循环，如何开始？';all('[data-loop-node]').forEach(el=>el.classList.remove('active','visited'))});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLoop()});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopLoop()}).observe($('#distance-6'));

$('#practice-reframe').addEventListener('click',()=>{$('#practice-phrase').textContent='我知道你忙，但我今天特别想你，听到你的声音我会好很多。';$('#practice-feedback').hidden=false;$('#practice-reframe').hidden=true;if(!reduced)gsap.from('#practice-phrase',{opacity:0,y:10,duration:.7})});
all<HTMLButtonElement>('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
 const text=b.dataset.copy!;try{await navigator.clipboard.writeText(text);toast('这句话已复制，愿它成为温和的开始。')}catch{const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'这句话已复制。':'请选中上方文字，手动复制。')}
}));
$('#replay-twist').addEventListener('click',()=>{
 if(reduced){paintTwist(1);toast('静态模式展示重新连接后的纸环。');return}
 stopTwist();paintTwist(0);animateTwist(1,14);
 $('#replay-twist').innerHTML='重播这次连接 <span aria-hidden="true">↗</span>';
});
all<HTMLButtonElement>('[data-twist-step]').forEach((button,index)=>button.addEventListener('click',()=>{
 animateTwist([.08,.52,1][index],1.6);
}));
function offerLight(phase?:number,offset?:number){
 stopTwist();
 tracePaused=false;paper?.setTracePaused(false);$('#trace-pause').setAttribute('aria-pressed','false');$('#trace-pause').textContent='暂停光点';
 if(phase===undefined)paper?.resetView();
 if(paintedTwist<1&&!reduced){$('#light-status').textContent='纸带正在重新相接，让光有一条连续的路。';animateTwist(1,3.2,()=>paper?.sendLight(phase,offset))}
 else{paintTwist(1);paper?.sendLight(phase,offset)}
}
$('#send-light').addEventListener('click',()=>offerLight());
$('#mobius-stage').addEventListener('paper-touch',((event:CustomEvent<{phase:number;offset:number}>)=>{
 if(paintedTwist<1){$('#light-status').textContent='先用下方按钮完成连接，再轻触纸面，让光出发。';return}
 offerLight(event.detail.phase,event.detail.offset);
}) as EventListener);
$('#pause-twist').addEventListener('click',()=>{
 if(!twistTween)return;
 const paused=!twistTween.paused();twistTween.paused(paused);
 $('#pause-twist').setAttribute('aria-pressed',String(paused));$('#pause-twist').textContent=paused?'继续形变':'暂停形变';
});
$('#trace-pause').addEventListener('click',()=>{
 tracePaused=!tracePaused;paper?.setTracePaused(tracePaused);$('#trace-pause').setAttribute('aria-pressed',String(tracePaused));$('#trace-pause').textContent=tracePaused?'继续光点':'暂停光点';
});
$('#reset-paper-view').addEventListener('click',()=>paper?.resetView());

initSimulator();initJourney();setupMotion();measureChapters();updateProgress();
initOpticalTitles(()=>{measureChapters();ScrollTrigger.refresh();paper?.refresh()});
// The entire article and every non-3D interaction work before the optional renderer arrives.
async function loadPaper(){try{const {createPaper}=await import('./paper');paper=createPaper(reduced);paper.setOpening(opening.progress());ScrollTrigger.refresh();paintTwist(paintedTwist<0?(reduced?1:0):paintedTwist);paper.refresh()}catch{document.documentElement.classList.add('no-webgl');paintTwist(1)}
 paper?.setTracePaused(tracePaused);
 if(document.documentElement.classList.contains('no-webgl')){opening.start();all<HTMLButtonElement|HTMLInputElement>('[data-twist-step],#replay-twist,#flip-ring,[data-paper-control]').forEach(b=>b.disabled=true)}
}
if(document.documentElement.dataset.opening==='pending')void loadPaper();
else if('requestIdleCallback' in window)window.requestIdleCallback(()=>{void loadPaper()},{timeout:1200});else setTimeout(()=>{void loadPaper()},200);
document.fonts.ready.then(()=>{ScrollTrigger.refresh();paper?.refresh()});
if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)setTimeout(()=>scrollToElement(target,'instant'),100)}
