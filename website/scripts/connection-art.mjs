// World-space paper architecture. data-points also lets the browser re-project
// the same physical model into a diagonal composition on narrow screens.
const W=(u,v,z=0)=>({u,v,z});
const project=({u,v,z})=>({x:515+u+v*.35,y:375-v*.5-z});
const path=(points,attrs='')=>`<path data-points='${JSON.stringify(points)}' d="${points.map((p,i)=>{const q=project(p);return `${i?'L':'M'}${q.x},${q.y}`}).join(' ')}Z" ${attrs}/>`;
const quad=(x1,x2,v1,v2,z,attrs)=>path([W(x1,v1,z),W(x2,v1,z),W(x2,v2,z),W(x1,v2,z)],attrs);
const wall=(u1,u2,v1,v2,z1,z2,attrs)=>path([W(u1,v1,z1),W(u2,v2,z1),W(u2,v2,z2),W(u1,v1,z2)],attrs);
const disc=(u,v,z,r,attrs)=>path(Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;return W(u+Math.cos(a)*r,v+Math.sin(a)*r,z)}),attrs);
const room=(side)=>{
 const s=side==='blue'?-1:1,a=s*440,b=s*200;
 return `<g class="court-room court-room-${side}">
 ${quad(a,b,0,180,-5,`class="court-paper-edge ${side}"`)}
 ${quad(a,b,0,180,0,`class="court-private-floor ${side}" fill="url(#court-floor-${side})"`)}
 ${wall(a,b,180,180,0,125,`class="court-back-wall ${side}" fill="url(#court-wall-${side})"`)}
 ${wall(a,a,0,180,0,125,`class="court-outer-wall ${side}" fill="url(#court-side-${side})"`)}
 ${wall(a,b,180,180,125,128,'class="court-cut-edge"')}
 ${wall(a,a,0,180,125,128,'class="court-cut-edge"')}
 ${quad(Math.min(a,b)+15,Math.max(a,b)-15,14,165,.2,'class="court-inset-line"')}
 </g>`;
};
const doorFrame=side=>{
 const s=side==='blue'?-1:1,u=s*200;
 return `<g class="court-door-frame ${side}">
 ${wall(u,u,116,180,0,125,`fill="url(#court-side-${side})"`)}
 ${wall(u,u,36,116,92,125,`fill="url(#court-wall-${side})"`)}
 ${wall(u,u,0,36,0,125,`fill="url(#court-side-${side})"`)}
 ${wall(u,u,0,180,125,128,'class="court-cut-edge"')}
 ${wall(u,u,36,116,0,92,`class="court-door" id="court-door-${side}" fill="url(#court-wall-${side})"`)}
 </g>`;
};
const book=`<g class="court-book">
 ${quad(-395,-287,109,161,28,'fill="#233b4a"')}
 ${wall(-395,-287,109,109,20,28,'fill="#638899"')}
 ${path([W(-383,116,31),W(-343,119,34),W(-343,154,34),W(-383,151,31)],'fill="#b8c6c1"')}
 ${path([W(-343,119,34),W(-300,116,31),W(-300,151,31),W(-343,154,34)],'fill="#d0d3c7"')}
 ${[0,1,2,3].map(i=>wall(-376,-351,123+i*6,125+i*6,31.5,32,'fill="#738d91"')).join('')}
 ${wall(-343,-343,119,154,34,34.5,'fill="#728d99"')}
 </g>`;
const plant=`<g class="court-plant">
 ${path([W(365,135),W(395,135),W(400,138,34),W(360,138,34)],'fill="#b58c7c"')}
 ${disc(380,138,34,20,'fill="#6d4b46"')}
 ${wall(380,381,138,138,34,97,'fill="#c1a897"')}
 ${path([W(381,138,65),W(346,134,101),W(368,138,104)],'fill="#a0a48e"')}
 ${path([W(381,138,83),W(409,145,111),W(404,139,84)],'fill="#c2bdaa"')}
 ${path([W(381,138,99),W(371,136,130),W(390,138,117)],'fill="#cac6ad"')}
 </g>`;
const chair=side=>{
 const u=side==='blue'?-90:90;
 return `<g class="court-chair ${side}" id="court-chair-${side}">
 ${quad(u-25,u+25,68,115,22,`fill="url(#court-wall-${side})"`)}
 ${wall(u-25,u+25,115,115,22,65,`fill="url(#court-wall-${side})"`)}
 ${wall(u-25,u+25,68,68,5,22,`class="court-chair-front ${side}"`)}
 ${wall(u-25,u+25,115,115,65,67,'class="court-cut-edge"')}
 </g>`;
};
const archPoints=(v,outer,inner)=>{
 const a=Array.from({length:41},(_,i)=>{const t=Math.PI-Math.PI*i/40;return W(Math.cos(t)*outer,v,Math.sin(t)*183)});
 const b=Array.from({length:41},(_,i)=>{const t=Math.PI*i/40;return W(Math.cos(t)*inner,v,Math.sin(t)*164)});
 return [...a,...b];
};
const person=side=>{const p=project(W(side==='blue'?-90:90,92,32));return `<g class="court-person ${side}" id="court-person-${side}" transform="translate(${p.x} ${p.y})" aria-hidden="true"><ellipse class="court-person-shadow" cy="13" rx="16" ry="7"/><circle r="24" class="court-person-halo"/><path d="M-5 8L-7-3Q0-14 7-3L5 8Z" class="court-person-paper"/><circle cy="-9" r="4" class="court-person-head"/></g>`};
const label=(side,title)=>`<button class="court-room-control ${side}" id="court-room-${side}" aria-pressed="false" disabled><span class="court-control-index">${side==='blue'?'01 / MINE':'03 / YOURS'}</span><strong>${title}</strong><small class="court-action">推门去庭院 <i aria-hidden="true">↗</i></small></button>`;
export const mirrorInstallation=`
<div id="mirror-installation" class="mirror-installation courtyard-installation" data-established="false" data-blue="home" data-red="home" role="group" aria-label="我的房间、你的房间，以及我们的庭院" aria-describedby="court-hint">
 <div class="court-heading"><span>一张纸 · 三处空间</span><span>亲密，也容得下自己</span></div>
 <div class="court-stage">
 <svg class="court-art" viewBox="0 0 1100 530" aria-hidden="true">
  <defs>
   <linearGradient id="court-floor-blue" x2=".8" y2="1"><stop stop-color="#557582"/><stop offset="1" stop-color="#243a4b"/></linearGradient>
   <linearGradient id="court-floor-red" x2=".6" y2="1"><stop stop-color="#84676a"/><stop offset="1" stop-color="#49323e"/></linearGradient>
   <linearGradient id="court-wall-blue" x2=".75" y2="1"><stop stop-color="#b8cfd1"/><stop offset=".55" stop-color="#7d9ba8"/><stop offset="1" stop-color="#4c6c84"/></linearGradient>
   <linearGradient id="court-wall-red" x2=".75" y2="1"><stop stop-color="#e4c8b4"/><stop offset=".55" stop-color="#bb9693"/><stop offset="1" stop-color="#825e6c"/></linearGradient>
   <linearGradient id="court-side-blue"><stop stop-color="#24394c"/><stop offset="1" stop-color="#7395a5"/></linearGradient>
   <linearGradient id="court-side-red"><stop stop-color="#694d5a"/><stop offset="1" stop-color="#ae8c88"/></linearGradient>
   <linearGradient id="court-fold-paper" gradientUnits="userSpaceOnUse" x1="315" y1="330" x2="715" y2="330"><stop stop-color="#52667a"/><stop offset=".48" stop-color="#bda886"/><stop offset=".52" stop-color="#c8ad90"/><stop offset="1" stop-color="#78565f"/></linearGradient>
   <linearGradient id="court-arch-paper" x2=".8" y2="1"><stop stop-color="#f1e7cb"/><stop offset=".35" stop-color="#c7b69a"/><stop offset=".7" stop-color="#9a8165"/><stop offset="1" stop-color="#766859"/></linearGradient>
   <radialGradient id="court-light"><stop stop-color="#f5d397" stop-opacity=".68"/><stop offset=".4" stop-color="#f3c27e" stop-opacity=".22"/><stop offset="1" stop-color="#e7bb7e" stop-opacity="0"/></radialGradient>
   <radialGradient id="court-shadow"><stop stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
   <clipPath id="court-floor-clip">${quad(-200,200,0,180,0,'')}</clipPath>
  </defs>
  ${quad(-480,480,-65,225,-18,'fill="url(#court-shadow)"')}
  ${quad(-200,200,0,180,0,'class="court-plan"')}
  ${room('blue')}${room('red')}
  <g class="court-folds">${['blue','red'].map(side=>{const s=side==='blue'?-1:1;return `<g id="court-fold-${side}">${Array.from({length:4},(_,i)=>quad(s*(200-i*50),s*(150-i*50),0,180,0,'fill="url(#court-fold-paper)"')).join('')}</g>`}).join('')}</g>
  <g id="court-common">
   <g id="court-canopy">
    ${path(archPoints(180,176,154),'fill="#695e50"')}
    ${path(archPoints(165,176,154),'class="court-arch" fill="url(#court-arch-paper)"')}
    ${wall(-176,-176,165,180,0,5,'fill="#b9a990"')}
    ${wall(176,176,165,180,0,5,'fill="#b9a990"')}
   </g>
   ${disc(0,93,.5,192,'class="court-warmth" fill="url(#court-light)" clip-path="url(#court-floor-clip)"')}
   ${chair('blue')}${chair('red')}
   <g id="court-table">
    ${disc(0,94,0,75,'fill="url(#court-shadow)" opacity=".6"')}
    ${wall(-7,7,94,94,0,43,'fill="#a08a70"')}
    ${disc(0,94,41,58,'fill="#88745f"')}
    ${disc(0,94,45,58,'fill="#d5b998"')}
    ${disc(-24,94,46,11,'fill="#7b939e"')}${disc(24,94,46,11,'fill="#b97d77"')}
    ${wall(-31,-17,94,94,47,56,'fill="#b2c7c9"')}${disc(-24,94,56,7,'fill="#425e6c"')}
    ${wall(17,31,94,94,47,56,'fill="#dbb5a4"')}${disc(24,94,56,7,'fill="#80594e"')}
   </g>
  </g>
  ${book}${plant}
  ${person('blue')}${person('red')}
  ${doorFrame('blue')}${doorFrame('red')}
  ${['blue','red'].map(side=>{const s=side==='blue'?-1:1;return path([W(s*440,0),W(s*200,0),W(s*200,180,125),W(s*440,180,125)],`class="court-touch" data-side="${side}" fill="transparent"`)}).join('')}
  <g class="court-static-labels" text-anchor="middle" fill="#dec49d" font-size="24"><text x="195" y="432">我的房间</text><text x="575" y="110">我们的庭院</text><text x="835" y="432">你的房间</text></g>
 </svg>
 ${label('blue','我的房间')}${label('red','你的房间')}
 <div class="court-common-label"><span>02 / OURS</span><strong>我们的庭院</strong><small id="court-common-note">由两个人，一起展开</small></div>
 <span class="court-reservation blue" id="court-reserved-blue">位置为我留着</span>
 <span class="court-reservation red" id="court-reserved-red">位置为你留着</span>
 <div class="court-fold-note" aria-hidden="true">推开门，纸页会在这里展开<i></i></div>
 </div>
 <div class="court-caption">
  <span class="court-caption-label">安全的联结</span>
  <p id="court-status" role="status">有一个我，有一个你，也有一个我们</p>
  <p id="court-hint">分别轻触两间房，推开各自的门</p>
  <button id="court-reset" disabled>重新展开 <span aria-hidden="true">↺</span></button>
  <small class="court-source">文章意象 · 互动示意</small>
 </div>
 <noscript><style>.courtyard-installation .court-stage{aspect-ratio:1100/490}.courtyard-installation .court-room-control,.courtyard-installation .court-common-label,.courtyard-installation .court-fold-note,.courtyard-installation #court-reset,.courtyard-installation #court-hint{display:none}.courtyard-installation .court-static-labels{display:block}</style></noscript>
</div>`;
