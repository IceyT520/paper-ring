import {gsap} from 'gsap';
import type {PaperController} from './paper';
import {finaleScore} from './finale-score';
import {fadeText,fadeDialog} from './text-motion';

export function initFinale(options:{paper:()=>PaperController|undefined;reduced:()=>boolean;beforeOpen:()=>void}){
 const dialog=document.querySelector<HTMLDialogElement>('#connection-film')!;
 const entry=document.querySelector<HTMLButtonElement>('#watch-finale')!;
 const pause=dialog.querySelector<HTMLButtonElement>('#finale-pause')!;
 const replay=dialog.querySelector<HTMLButtonElement>('#finale-replay')!;
 const stage=dialog.querySelector<HTMLElement>('#finale-stage')!;
 const chapter=dialog.querySelector<HTMLElement>('#finale-chapter')!,title=dialog.querySelector<HTMLElement>('#finale-title')!,description=dialog.querySelector<HTMLElement>('#finale-description')!;
 const time=dialog.querySelector<HTMLElement>('#finale-time')!;
 const captions=[
  ['01 / 两面','同一张纸<br><span class="finale-blue">你的世界</span>，<span class="finale-red">我的世界</span>','我们曾以为，彼此在无法抵达的两面。'],
  ['02 / 松开','松开<br>旧的连接','为另一种可能，留一道缝。'],
  ['03 / 转身','只转过半圈<br>世界开始不同','改变的，是我们看向彼此的角度。'],
  ['04 / 相连','没有越过边缘<br>却抵达了<span class="finale-shared">另一面</span>','让一道光，沿着我们共同的纸面前行。'],
  ['05 / 同一面','走向你<br>也<span class="finale-warm">不必离开自己</span>','从两面，到同一面。']
 ];
 let tween:gsap.core.Tween|undefined,captionTween:gsap.core.Tween|undefined;
 let overflow='',padding='',lastChapter=-1,autoPaused=false,clock={seconds:0},readyTimer:ReturnType<typeof setTimeout>|undefined;
 function paint(){
  const score=finaleScore(clock.seconds);options.paper()?.setFinale(clock.seconds);
  dialog.dataset.progress=(clock.seconds/22).toFixed(5);
  dialog.style.setProperty('--film-progress',String(clock.seconds/22));
  dialog.style.setProperty('--film-warmth',String(score.warmth));
  dialog.style.setProperty('--film-reveal',String(score.reveal));
  dialog.style.setProperty('--film-end',String(score.finale));
  fadeText(time,`${String(Math.floor(clock.seconds)).padStart(2,'0')} / 22`);
  if(score.chapter!==lastChapter){
   lastChapter=score.chapter;const text=captions[lastChapter];
   const show=()=>{chapter.textContent=text[0];title.innerHTML=text[1];description.textContent=text[2]};
   captionTween?.kill();
   if(options.reduced()||dialog.dataset.state==='still'){show();gsap.set('.finale-caption',{opacity:1,y:0})}
   else captionTween=gsap.to('.finale-caption',{opacity:0,y:-6,duration:.24,onComplete:()=>{show();captionTween=gsap.fromTo('.finale-caption',{y:10,opacity:0},{y:0,opacity:1,duration:.85,ease:'power2.out'})}});
  }
 }
 function setPaused(value:boolean){
  tween?.paused(value);captionTween?.paused(value);
  dialog.dataset.state=value?'paused':'playing';fadeText(pause,value?'继续放映':'暂停放映');pause.setAttribute('aria-pressed',String(value));
 }
 function play(){
  clearTimeout(readyTimer);stage.removeEventListener('paper-ready',play);
  if(!dialog.open||dialog.dataset.state==='closing')return;
  tween?.kill();captionTween?.kill();clock={seconds:0};lastChapter=-1;autoPaused=false;
  const still=options.reduced()||document.documentElement.classList.contains('no-webgl');
  pause.disabled=still;replay.disabled=still;pause.setAttribute('aria-pressed','false');fadeText(pause,'暂停放映');
  dialog.dataset.state=still?'still':'playing';
  if(still){clock.seconds=22;paint();return}
  paint();
  tween=gsap.to(clock,{seconds:22,duration:22,ease:'none',onUpdate:paint,onComplete:()=>{dialog.dataset.state='ended';pause.disabled=true;fadeText(pause,'放映结束')}});
 }
 function close(){if(dialog.open){autoPaused=false;tween?.pause();captionTween?.pause();dialog.dataset.state='closing';fadeDialog(dialog,false)}}
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('close',()=>{
  clearTimeout(readyTimer);stage.removeEventListener('paper-ready',play);tween?.kill();captionTween?.kill();tween=captionTween=undefined;
  document.body.style.overflow=overflow;document.body.style.paddingRight=padding;
  options.paper()?.setFinale(null);options.paper()?.refresh();entry.focus({preventScroll:true});
 });
 entry.addEventListener('click',()=>{
  if(dialog.open)return;options.beforeOpen();overflow=document.body.style.overflow;padding=document.body.style.paddingRight;
  const gutter=innerWidth-document.documentElement.clientWidth;
  if(gutter>0)document.body.style.paddingRight=`${gutter}px`;
  document.body.style.overflow='hidden';dialog.dataset.state='loading';fadeDialog(dialog,true);dialog.focus({preventScroll:true});
  clock={seconds:0};lastChapter=-1;paint();options.paper()?.refresh();
  if(stage.classList.contains('ready')||document.documentElement.classList.contains('no-webgl'))play();
  else{stage.addEventListener('paper-ready',play,{once:true});readyTimer=setTimeout(play,1800)}
 });
 dialog.querySelector('#finale-close')!.addEventListener('click',close);
 replay.addEventListener('click',play);
 pause.addEventListener('click',()=>{if(dialog.dataset.closing)return;autoPaused=false;setPaused(dialog.dataset.state!=='paused')});
 dialog.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))e.preventDefault();
  if(e.code==='Space'&&e.target===dialog){e.preventDefault();if(!pause.disabled)pause.click()}
 });
 document.addEventListener('visibilitychange',()=>{
  if(!dialog.open)return;
  if(document.hidden&&dialog.dataset.state==='playing'){setPaused(true);autoPaused=true}
  else if(!document.hidden&&autoPaused){autoPaused=false;setPaused(false)}
 });
 window.addEventListener('pagehide',close);
 return{close};
}
