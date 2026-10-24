import {foldMark} from './narrative-art.mjs';
﻿// Code-native illustrations: each line responds to a mechanism in the essay.
const path=(d,cls='',extra='')=>`<path d="${d}" class="${cls}" ${extra}/>`;
const svg=(body,cls='',view='0 0 900 440')=>`<svg class="narrative-svg ${cls}" viewBox="${view}" fill="none" aria-hidden="true">${body}</svg>`;
const label=(x,y,text,cls='')=>`<text x="${x}" y="${y}" class="diagram-label ${cls}">${text}</text>`;
const node=(x,y,cls)=>`<circle cx="${x}" cy="${y}" r="5" class="node ${cls}"/><circle cx="${x}" cy="${y}" r="17" class="node-halo ${cls}"/>`;
// One physical accordion, with different words printed on the two faces.
export const defenseSculpture=(()=>{
 const wing=(side,words,inner)=>{
  const fold=i=>`<div class="defense-fold fold-${['first','second','third'][i]}"><div class="fold-face fold-front"><small>0${i+1}</small><span>${words[i]}</span><i></i>${i===0?foldMark:''}</div><div class="fold-face fold-back"><small>0${i+1}</small><span>${inner[i]}</span><i></i>${i===0?foldMark:''}</div>${i<2?fold(i+1):''}</div>`;
  return `<div class="defense-wing defense-wing-${side}">${fold(0)}</div>`;
 };
 return `<div class="wall-art defense-scene">
  <div class="defense-kicker"><span>防御的两面</span><span id="defense-view">外侧 · 看得见的退缩</span></div>
  <div class="defense-viewport">
   <div class="defense-key-light" aria-hidden="true"></div><div class="defense-inner-aura" aria-hidden="true"></div>
   <div class="defense-ground" aria-hidden="true"><svg viewBox="0 0 600 130" fill="none"><ellipse cx="300" cy="65" rx="235" ry="46"/><path d="M45 65H65M535 65H555M300 7V19M300 111V123"/></svg></div>
   <div class="defense-cast-shadow" aria-hidden="true"></div><div class="defense-beam" aria-hidden="true"></div>
   <div class="defense-object" aria-hidden="true">
    <div class="defense-note"><div class="note-face note-front"><span class="note-index">心里的一小部分</span><strong>想靠近</strong><small>也怕受伤</small></div><div class="note-face note-back"><span class="note-index">没有说出口的需要</span><strong>我也想<br>被理解</strong><small>只是害怕，再一次受伤</small><i></i></div></div>
    ${wing('left',['沉默','转移话题','抽身离开'],['怕被拒绝','怕被看穿','怕再受伤'])}
    ${wing('right',['不需要','没关系','都可以'],['想被接纳','想被理解','想靠近'])}
   </div>
   <div class="defense-visitor" aria-hidden="true"><i></i><span>你的靠近</span></div>
   <button class="defense-touch-target" disabled aria-label="靠近纸墙，观察防御收拢" aria-pressed="false" aria-describedby="defense-instruction wall-response"></button>
  </div>
  <p class="defense-instruction" id="defense-instruction"><span class="defense-mouse-hint">把光标移向纸片中央，看看它如何回应。</span><span class="defense-touch-hint">轻触折页，看看靠近时会发生什么。</span></p>
  <div class="defense-actions"><button class="text-button" id="wall-approach" disabled aria-pressed="false">靠近一点 <span>↑</span></button><button class="text-button wall-toggle" id="wall-perspective" disabled aria-pressed="false">绕到墙后 <span>↗</span></button></div>
  <p class="wall-response" id="wall-response" role="status">想靠近，也会先保护自己。</p>
  <p class="defense-footnote">墙外是退缩，墙内仍有需要。折痕，会跟着这张纸走下去。</p>
 </div>`;
})();
// A mathematical Mobius surface remains visible even without WebGL or JavaScript.
export const mobiusFallback=(()=>{
 const project=(u,v)=>{
  let x=(2.24+v*Math.cos(u/2))*Math.cos(u),y=(2.24+v*Math.cos(u/2))*Math.sin(u),z=v*Math.sin(u/2);
  const rz=-.52,ry=-.45,rx=.68;
  [x,y]=[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz)];
  [x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
  [y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];
  const perspective=11.8/(11.8-z);return{x:350+x*103*perspective,y:320-y*103*perspective,z};
 };
 const strips=Array.from({length:180},(_,i)=>{
  const u=i/180*Math.PI*2,next=(i+1)/180*Math.PI*2;
  const pts=[project(u,-.71),project(next,-.71),project(next,.71),project(u,.71)];
  const light=.74+.24*Math.abs(Math.cos(u/2+.9));
  const color=`rgb(${Math.round(239*light)},${Math.round(228*light)},${Math.round(208*light)})`;
  return{depth:pts.reduce((n,p)=>n+p.z,0)/4,markup:`<path d="${pts.map((p,j)=>`${j?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')}Z" fill="${color}" stroke="${color}" stroke-width=".5"/>`};
 }).sort((a,b)=>a.depth-b.depth);
 return `<svg class="ring-fallback" viewBox="0 0 700 640" aria-hidden="true">${strips.map(s=>s.markup).join('')}</svg>`;
})();
export const atmosphere=`<div class="journey-atmosphere" aria-hidden="true"><div class="atmosphere-blue"></div><div class="atmosphere-red"></div><svg class="peripheral-threads" viewBox="0 0 1440 1000" preserveAspectRatio="none"><path class="thread-blue" d="M120 -80C330 180 -170 320 65 580S230 870 105 1080"/><path class="thread-red" d="M1330 -80C1150 220 1590 370 1370 600S1220 950 1370 1080"/></svg></div>`;
const originForm=(side,index,name,title,caption)=>`<div class="origin-form origin-${side}"><div class="origin-object" aria-hidden="true"><div class="origin-pool"></div><div class="origin-floor-shadow"></div><div class="origin-need"><small>内心的需要</small><strong>想被爱</strong><i></i></div><div class="origin-fan">${Array.from({length:7},(_,i)=>`<i class="origin-fold" style="--fold:${i-3};z-index:${7-Math.abs(i-3)}"><span>${String(i+1).padStart(2,'0')}</span></i>`).join('')}<i class="origin-pin"></i></div></div><div class="origin-copy"><span>${index} / ${name}</span><h4>${title}</h4><p>${caption}</p></div></div>`;
const originStudy=`<figure class="flow-study study-origin" data-art><div class="study-kicker"><span>TWO FOLDS / ONE NEED</span><span>01 / 同源</span></div><div class="origin-scene" data-state="protected">${originForm('blue','01','回避','把需要藏起来','<span>“不需要”，</span><span>有时是怕再次受伤</span>')}<div class="origin-shared"><span class="origin-shared-label">同一个起点</span><button id="origin-reveal" aria-pressed="false" aria-describedby="origin-response"><span class="origin-light" aria-hidden="true"><i></i><b></b></span><span class="origin-shared-word">想被爱</span><span id="origin-action">轻触，放下防御</span></button><i class="origin-root" aria-hidden="true"></i></div>${originForm('red','02','焦虑','让呼唤伸得更远','<span>“别离开”，</span><span>有时是怕不再被爱</span>')}</div><p id="origin-response" class="origin-response" role="status">一个把需要收进纸褶，一个把需要向外展开。</p><figcaption><h3>同一个起点，不同的保护方式</h3><p>看见不同的姿态，也试着看见它们保护着的同一个需要。</p><small>文章意象 · 轻触暖光，来回观察</small></figcaption></figure>`;
export function flowStudy(type){
 if(type==='origin')return originStudy;
 let art='',caption='',title='';
 if(type==='resonance'){
  title='没有回应的地方，呼唤变得越来越响';caption='需求被放大，是为了不再被忽略。';
  for(let i=0;i<14;i++){
   const points=Array.from({length:130},(_,j)=>{const x=40+j*6.35,a=(x/900)**1.4*(100+i*5),y=220+Math.sin(j*.115+i*.07)*a;return `${j?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`}).join(' ');
   art+=path(points,'red-line contour');
  }
  art+=path('M40 220H860','baseline')+node(48,220,'red-node')+label(48,390,'一个小小的需要','red-label')+label(660,40,'越来越响的呼唤','red-label');
 }else if(type==='delay'){
  title='同一条消息，两种时间';caption='发出只需一瞬，等待却被拉得很长。';
  art+=path('M100 120H800M100 320H800','baseline');
  for(let i=0;i<7;i++){
   const x=160+i*90;
   art+=path(`M${x} 120C${x+90} 120 ${x+40} 320 ${x+180} 320`,'bridge-line');
   art+=`<circle cx="${x}" cy="120" r="${i===0?6:3}" class="red-node"/><circle cx="${x+100}" cy="320" r="3" class="blue-node"/>`;
  }
  art+=path('M160 120C350 120 450 320 710 320','signal-travel')+label(100,83,'已发送 / 23:47','red-label')+label(620,365,'未回复 / — — : — —','blue-label');
 }else if(type==='weave'){
  title='不是完全重合，而是找到交点';caption='各自保留自己的节奏，也为彼此留下共同的时刻。';
  const crossings=[237.5,662.5];
  art+='<defs><mask id="weave-over-red" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="440"><rect width="900" height="440" fill="white"/><circle cx="662.5" cy="220" r="15" fill="black"/></mask><mask id="weave-over-blue" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="440"><rect width="900" height="440" fill="white"/><circle cx="237.5" cy="220" r="15" fill="black"/></mask></defs>';
  for(let i=0;i<8;i++){
   for(const [side,color] of [[-1,'red'],[1,'blue']]){
    const d=Array.from({length:201},(_,j)=>{const x=25+j*4.25,y=220+side*(70+i*5)*Math.cos(j/200*Math.PI*2);return `${j?'L':'M'}${x} ${y.toFixed(4)}`}).join(' ');
    art+=path(d,`${color}-line contour`,`mask="url(#weave-over-${color})"`);
   }
  }
  art+=crossings.map((x,i)=>`<g class="weave-crossing" data-crossing="${x}">${path(`M${x} 247V355`,'crossing-leader')}${node(x,220,'gold-node')}${label(x,395,['提前告知','约定回应'][i],'centered-label')}</g>`).join('');
 }
 const controls=type==='delay'?`<div class="letter-flight"><div class="flight-distance" aria-hidden="true"><span>此刻 · 我</span><span>彼处 · 你</span></div><svg class="flight-thread" viewBox="0 0 800 240" preserveAspectRatio="none" aria-hidden="true"><path d="M80 166C270 166 380 68 700 88"/></svg><div class="letter-destination" aria-hidden="true"><i></i><span>留在这里，等你看见。</span></div><button id="send-signal" class="paper-letter" aria-label="投出这封信，也可以向右拖动松手"><span class="letter-fold"></span><span class="letter-writing">今天也很想你。</span><span class="letter-stamp">想念<br>23:47</span></button><span class="flight-hint">捏住信纸，向右轻轻投出 <i>↗</i></span><button id="signal-reset" class="text-button" hidden>取回这封信 <span>↙</span></button></div><p id="signal-status" class="art-status" role="status">按一下，也能把想念送出去。</p>`:'';
 return `<figure class="flow-study study-${type}" data-art><div class="study-kicker"><span>RELATIONSHIP ATLAS</span><span>${{origin:'01 / 同源',resonance:'02 / 增幅',delay:'03 / 延迟',weave:'04 / 交点'}[type]}</span></div>${svg(art)}${controls}<figcaption><h3>${title}</h3><p>${caption}</p><small>文章意象 · 视觉示意</small></figcaption></figure>`;
}
export const heroThreads=svg(`${Array.from({length:9},(_,i)=>path(`M${120+i*7} 440C${-40+i*5} 230 ${350+i*6} 310 ${420+i*7} 110S${750+i*8} -50 900 ${90+i*6}`,'blue-line contour')).join('')}${Array.from({length:9},(_,i)=>path(`M0 ${340+i*6}C230 ${500+i*5} 470 ${-70+i*7} 620 ${110+i*5}S770 380 900 ${260+i*5}`,'red-line contour')).join('')}`,'hero-threads');
export const anxiousInstrument=`<aside class="anxious-instrument" data-art><span class="eyebrow">THE ECHO CHAMBER / 需要的回声</span><div class="echo-chamber"><div class="echo-orbits" aria-hidden="true"><i></i><i></i><i></i></div><div id="echo-ripples" aria-hidden="true"></div><div id="echo-words" aria-hidden="true"></div><button id="call-need" class="echo-core" aria-label="轻叩纸面，发出一次呼唤"><span class="echo-core-light"></span><span class="disc-word">你在吗</span><small>轻叩，让需要被听见</small></button><button id="answer-need" class="echo-answer" aria-pressed="false"><i aria-hidden="true"></i><span>我在</span><small>把这一句，交还给你</small></button></div><div class="instrument-key"><span class="anx-label">每一次轻叩，都留下一圈回声</span><span>05 / ECHO</span></div><p id="need-response" class="art-status" role="status">试着叩几下，再触碰蓝色的“我在”。</p></aside>`;
export {mirrorInstallation} from './connection-art.mjs';
export const subtitleOrbits=svg(`${path('M210 220C210 70 530 60 610 220S320 420 210 220','red-line orbit-stroke')}${path('M690 220C690 60 370 70 290 220S580 420 690 220','blue-line orbit-stroke')}${node(290,220,'red-node')}${node(610,220,'blue-node')}`,'subtitle-orbits');
const promiseX=[100,300,500,700];
const loomY=(x,side)=>side===0?88+25*Math.sin((x-80)/640*Math.PI*2):212-22*Math.sin((x-80)/640*Math.PI*2);
const loomThread=(side,color)=>{
 const d=Array.from({length:321},(_,i)=>{const x=i*2.5;return `${i?'L':'M'}${x} ${loomY(x,side).toFixed(4)}`}).join(' ');
 return `<path d="${d}" class="ribbon-body ribbon-${color}"/><path id="rhythm-${color}" d="${d}" class="${color}-line"/>`;
};
const promiseClasp=(x,i)=>{
 const top=loomY(x,0),bottom=loomY(x,1),middle=(top+bottom)/2;
 return `<g class="promise-stitch" data-stitch="${i}"><path class="stitch-cord" pathLength="1" d="M${x} ${top}C${x-12} ${top+20} ${x-12} ${middle-22} ${x} ${middle-8}M${x} ${middle+8}C${x+12} ${middle+22} ${x+12} ${bottom-20} ${x} ${bottom}"/><circle class="stitch-anchor" data-anchor="red" cx="${x}" cy="${top}" r="3.5"/><circle class="stitch-anchor" data-anchor="blue" cx="${x}" cy="${bottom}" r="3.5"/><ellipse class="stitch-knot" cx="${x}" cy="${middle}" rx="5" ry="8"/><path class="stitch-guide" d="M${x} ${bottom+14}V285"/></g>`;
};
export const rhythm=`<div class="rhythm-instrument" data-art><div class="study-kicker"><span>THE LITTLE PROMISES</span><span>一针一线 / 留下相遇的时刻</span></div><div class="promise-loom"><svg id="rhythm-svg" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">${loomThread(0,'red')}${loomThread(1,'blue')}${promiseX.map(promiseClasp).join('')}</svg>${['问候','告知','倾听','未来'].map((t,i)=>`<button class="stitch-pin" data-promise="${i}" style="--pin:${promiseX[i]/8}%" aria-pressed="false" aria-label="缝下关于${t}的约定"><span class="pin-thread" aria-hidden="true"></span><span class="pin-eye" aria-hidden="true">+</span><span class="pin-label">${t}</span></button>`).join('')}</div><div class="promise-caption"><span id="rhythm-caption">在两条线之间，缝下一次约定。</span><small id="promise-count">00 / 04</small></div><p id="promise-detail" role="status">点亮针孔。保留各自的走向，也留下可以相遇的时刻。</p><button id="promise-reset" class="text-button">轻轻拆线，重新约定 <span>↶</span></button></div>`;
export {mobiusScene} from './narrative-art.mjs';
