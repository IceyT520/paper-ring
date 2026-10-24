import {initSoundscape} from './soundscape';
/** Background music: starts with the opening, loops, and can be switched off.
 *  The site streams `theme.mp3`; the packaged single file carries the track as
 *  base64 in `window.__paperTrack`, turned into a blob so it needs no sibling
 *  file. Without either, the control stays hidden and the exhibition is silent. */
const TRACK='theme.mp3';


declare global {
 interface Window { __paperTrack?: string }
}

/** A blob URL keeps large data URIs away from Safari's size limits. */
function trackSource(){
 const inline=window.__paperTrack;
 if(!inline)return TRACK;
 try{
  const binary=atob(inline),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));
 }catch{return TRACK}
}

export function initAudio(){
 const button=document.querySelector<HTMLButtonElement>('#sound-toggle');
 if(!button)return;
 const audio=new Audio(trackSource());
 audio.id='theme-audio';audio.hidden=true;document.body.append(audio);
 // Only the header is fetched up front; the file downloads when the seal breaks.
 audio.loop=true;audio.preload='metadata';audio.volume=0;
 let enabled=read()!=='off',failed=false,loaded=false,openingStartedAt=0,gestureBound=false,fade=0;
 const root=document.documentElement;
 let targetVolume=.12;

 function read(){try{return localStorage.getItem('paper-sound')}catch{return null}}
 function store(value:string){try{localStorage.setItem('paper-sound',value)}catch{/* private mode */}}
 function state(next:'playing'|'paused'|'unavailable'){root.dataset.audio=next}
 function sync(){
  button!.hidden=failed||!loaded;
  button!.setAttribute('aria-pressed',String(enabled));
  button!.setAttribute('aria-label',enabled?'关闭背景音乐':'开启背景音乐');
  button!.classList.toggle('sound-off',!enabled);
 }
 function ramp(target:number,ms:number){
  cancelAnimationFrame(fade);
  const from=audio.volume,start=performance.now();
  const step=(now:number)=>{
   const t=Math.min(1,(now-start)/ms);
   audio.volume=Math.max(0,Math.min(1,from+(target-from)*t));
   if(t<1)fade=requestAnimationFrame(step);
  };
  fade=requestAnimationFrame(step);
 }
 function play(seek?:number){
  if(failed||!enabled)return;
  if(seek!==undefined){try{audio.currentTime=seek}catch{/* not seekable yet */}}
  const started=audio.play();
  if(started&&typeof started.then==='function'){
   started.then(()=>{if(!enabled){audio.pause();return}state('playing');ramp(targetVolume,2400)})
    .catch(()=>{state('paused');bindGesture()});
  }else{state('playing');ramp(targetVolume,2400)}
 }
 /** Browsers refuse sound before a gesture: start on the first one, in sync. */
 function bindGesture(){
  if(gestureBound||failed)return;
  gestureBound=true;
  const once=()=>{
   document.removeEventListener('pointerdown',once,true);
   document.removeEventListener('keydown',once,true);
   document.removeEventListener('touchstart',once,true);
   gestureBound=false;
   const elapsed=openingStartedAt?(performance.now()-openingStartedAt)/1000:0;
   play(elapsed>1&&elapsed<14?elapsed:0);
  };
  document.addEventListener('pointerdown',once,true);
  document.addEventListener('keydown',once,true);
  document.addEventListener('touchstart',once,true);
 }

 audio.addEventListener('loadedmetadata',()=>{failed=false;loaded=true;sync()});
 audio.addEventListener('error',()=>{failed=true;state('unavailable');sync()});
 audio.addEventListener('play',()=>state('playing'));
 audio.addEventListener('pause',()=>state('paused'));

 // Breaking the seal is the gesture that lets the track start.
 document.addEventListener('paper:gate-open',()=>{openingStartedAt=performance.now();play(0)});

 document.addEventListener('paper:opening-start',event=>{
  const detail=(event as CustomEvent<{at:number;replay?:boolean}>).detail;
  openingStartedAt=detail?.at??performance.now();
  // The gate may already have started the track a moment ago; only a replay or
  // a stopped player should seek back to zero.
  if(detail?.replay||audio.paused)play(0);
 });
 button.addEventListener('click',()=>{
  if(failed)return;
  enabled=!enabled;store(enabled?'on':'off');sync();
  if(enabled){play()}
  else{ramp(0,320);setTimeout(()=>{if(!enabled)audio.pause()},350)}
 });

 initSoundscape(level=>{
  targetVolume=level;
  if(document.hidden){cancelAnimationFrame(fade);audio.volume=0;return}
  if(enabled&&!audio.paused)ramp(level,1800);
 });
 sync();
 // Without an opening (reduced motion, deep link) music still waits for a gesture.
 bindGesture();
}
