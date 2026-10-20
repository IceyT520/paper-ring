const floor=(side,x)=>`<g class="connection-floor connection-floor-${side}" transform="translate(${x} 250)">
 <ellipse class="room-shadow" cy="20" rx="184" ry="87" fill="url(#room-shadow)"/>
 <ellipse class="room-ground" rx="175" ry="80.5" fill="url(#room-floor-${side})"/>
 <ellipse class="room-engraving" rx="151" ry="69.5"/>
 <ellipse class="room-light" rx="122" ry="56" fill="url(#room-inner-light)"/>
 </g>`;
const walls=(side,cx,door)=>`<g class="connection-walls connection-walls-${side}">${Array.from({length:40},(_,i)=>{
 const a=door+.34+(Math.PI*2-.68)*i/40,b=door+.34+(Math.PI*2-.68)*(i+1)/40;
 const x=t=>(cx+Math.cos(t)*175).toFixed(2),y=t=>(250+Math.sin(t)*80.5).toFixed(2),top=t=>(178+Math.sin(t)*80.5).toFixed(2);
 return `<path class="room-wall" fill="url(#room-paper-${side})" d="M${x(a)} ${y(a)} A175 80.5 0 0 1 ${x(b)} ${y(b)} L${x(b)} ${top(b)} A175 80.5 0 0 0 ${x(a)} ${top(a)}Z"/><path class="room-rim" d="M${x(a)} ${top(a)} A175 80.5 0 0 1 ${x(b)} ${top(b)}"/>`;
}).join('')}</g>`;
const bridge='M290 250 L465 250 C512.6 350 587.4 350 635 250 L810 250';
export const mirrorInstallation=`
<div id="mirror-installation" class="mirror-installation connection-installation" data-space="together" data-state="connected" role="group" aria-label="保有自己，也能感到你在" aria-describedby="connection-hint">
 <div class="connection-head">
  <div><span>回避 / 需要自主</span><strong>保有自己</strong><small>亲近时，仍有自己的空间</small></div>
  <div><span>焦虑 / 需要可及</span><strong>感到你在</strong><small>开口时，能得到你的回应</small></div>
 </div>
 <div class="connection-stage">
  <svg class="connection-art" viewBox="0 0 1100 540" preserveAspectRatio="none" aria-hidden="true">
   <defs>
    <radialGradient id="room-shadow"><stop stop-color="#000" stop-opacity=".48"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="room-floor-blue"><stop stop-color="#90bfd2" stop-opacity=".17"/><stop offset="1" stop-color="#406d89" stop-opacity=".05"/></radialGradient>
    <radialGradient id="room-floor-red"><stop stop-color="#e6a89b" stop-opacity=".16"/><stop offset="1" stop-color="#b15e6d" stop-opacity=".05"/></radialGradient>
    <radialGradient id="room-inner-light"><stop stop-color="#efd0a0" stop-opacity=".52"/><stop offset=".35" stop-color="#efd0a0" stop-opacity=".24"/><stop offset="1" stop-color="#efd0a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="room-paper-blue" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#b5c9cf"/><stop offset=".35" stop-color="#7796ab"/><stop offset="1" stop-color="#203c53"/></linearGradient>
    <linearGradient id="room-paper-red" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#dec3b5"/><stop offset=".35" stop-color="#b28082"/><stop offset="1" stop-color="#502e3d"/></linearGradient>
    <linearGradient id="connection-gold" gradientUnits="userSpaceOnUse" x1="290" y1="0" x2="810" y2="0"><stop stop-color="#8fc7eb"/><stop offset=".4" stop-color="#dcc49d"/><stop offset=".65" stop-color="#efd4a6"/><stop offset="1" stop-color="#eca49a"/></linearGradient>
   </defs>
   ${floor('blue',290)}${floor('red',810)}
   <path class="connection-road-shadow" d="${bridge}"/>
   <path class="connection-road" d="${bridge}"/>
   <path id="connection-path" d="${bridge}" pathLength="1"/>
   <circle class="connection-traveler-halo" r="17"/><circle class="connection-traveler" r="4"/>
   ${walls('blue',290,0)}${walls('red',810,Math.PI)}
   <text class="connection-boundary boundary-blue" x="290" y="355">我的空间</text>
   <text class="connection-boundary boundary-red" x="810" y="355">你的空间</text>
  </svg>
  <span class="connection-message connection-message-blue" id="connection-blue-message"></span>
  <span class="connection-message connection-message-red" id="connection-red-message"></span>
  <button class="connection-person connection-person-blue" id="connection-space" aria-pressed="false" aria-label="留一点自己的空间，观察联结是否仍在" disabled>
   <strong>我</strong><span class="connection-orb" aria-hidden="true"></span><small id="connection-space-action">留一点空间 <i aria-hidden="true">↖</i></small>
  </button>
  <button class="connection-person connection-person-red" id="connection-call" aria-label="问一句你在吗，等待对方回应" disabled>
   <strong>你</strong><span class="connection-orb" aria-hidden="true"></span><small>轻触，问一句 <i aria-hidden="true">↗</i></small>
  </button>
  <div class="connection-bridge-note"><i aria-hidden="true"></i><span>始终可达</span><i aria-hidden="true"></i></div>
 </div>
 <div class="connection-caption">
  <span class="connection-caption-label">安全的联结</span>
  <p id="connection-status" role="status">靠近时保有自己，独处时也知道你在</p>
  <p id="connection-hint">轻触蓝色的光，留一点空间；轻触红色的光，试着呼唤</p>
  <button id="connection-replay" disabled>重看一次联结 <span aria-hidden="true">↺</span></button>
  <small class="connection-source">文章意象 · 互动示意</small>
 </div>
</div>`;
