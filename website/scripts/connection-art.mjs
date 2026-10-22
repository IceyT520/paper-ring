const wing=(side,outer,tip)=>`<g class="shelter-wing ${side}" id="shelter-${side}">
 <path class="shelter-paper" d="M${outer} 260L550 95L550 147L${tip} 311Z" fill="url(#shelter-paper-${side})"/>
 <path class="shelter-fold" d="M${outer} 260L550 147L${tip} 311Z"/>
 <path class="shelter-edge" d="M${outer} 260L550 95L550 147L${tip} 311Z"/>
 <path class="shelter-grain"/>
 <path class="shelter-crease" d="M${outer} 260L550 147"/>
</g>`;
const room=(side,x)=>`<g class="shelter-room ${side}" data-private="${side}">
 <path d="M${x-62} 250L${x+62} 250L${x+138} 480Q${x} 540 ${x-138} 480Z" fill="url(#shelter-beam-${side})"/>
 <ellipse cx="${x}" cy="480" rx="140" ry="48" fill="url(#shelter-floor-${side})"/>
 <ellipse class="shelter-boundary" cx="${x}" cy="480" rx="140" ry="48"/>
 <ellipse class="shelter-boundary inner" cx="${x}" cy="480" rx="133" ry="43"/>
 <path class="shelter-pendant" d="M${x} 270V313"/>
 <circle cx="${x}" cy="317" r="24" fill="url(#shelter-lamp-${side})"/>
 <circle cx="${x}" cy="317" r="3" fill="currentColor"/>
</g>`;
const lights=(side,color)=>`<linearGradient id="shelter-beam-${side}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".01"/><stop offset="1" stop-color="${color}" stop-opacity=".07"/></linearGradient>
<radialGradient id="shelter-floor-${side}"><stop stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity=".025"/></radialGradient>
<radialGradient id="shelter-lamp-${side}"><stop stop-color="${color}" stop-opacity=".38"/><stop offset=".2" stop-color="${color}" stop-opacity=".1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
export const mirrorInstallation=`
<div id="mirror-installation" class="mirror-installation shelter-installation" data-connected="false" role="group" aria-label="不能失去自己，不能没有你：共同撑起一片屋檐">
 <div class="connection-voices">
  <div class="connection-voice blue"><span>回避 · 害怕被吞没</span><strong data-voice="blue">不能失去自己</strong><small>我需要自己的空间</small></div>
  <div class="connection-voice red"><span>焦虑 · 害怕被抛弃</span><strong data-voice="red">不能没有你</strong><small>我需要确定你在</small></div>
 </div>
 <button id="connection-meet" class="shelter-stage" aria-label="轻触，一起撑起屋檐" aria-describedby="shelter-status" disabled>
  <svg class="shelter-art" viewBox="0 60 1100 560" preserveAspectRatio="none" aria-hidden="true">
   <defs>
    <linearGradient id="shelter-paper-blue" x1="0" y1="1" x2=".7" y2="0"><stop stop-color="#1e3d53"/><stop offset=".52" stop-color="#5b8297"/><stop offset=".98" stop-color="#c4d9d5"/></linearGradient>
    <linearGradient id="shelter-paper-red" x1="1" y1="1" x2=".3" y2="0"><stop stop-color="#53333b"/><stop offset=".52" stop-color="#ac7972"/><stop offset=".98" stop-color="#e9cabb"/></linearGradient>
    <linearGradient id="shelter-common-beam" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1d9a4" stop-opacity="0"/><stop offset=".35" stop-color="#f1d9a4" stop-opacity=".015"/><stop offset="1" stop-color="#f1d9a4" stop-opacity=".16"/></linearGradient>
    <radialGradient id="shelter-common-floor"><stop stop-color="#f4d39c" stop-opacity=".35"/><stop offset=".65" stop-color="#d7ae75" stop-opacity=".12"/><stop offset="1" stop-color="#d7ae75" stop-opacity="0"/></radialGradient>
    <radialGradient id="shelter-common-lamp"><stop stop-color="#fff0c9" stop-opacity=".5"/><stop offset=".16" stop-color="#f2d39b" stop-opacity=".16"/><stop offset="1" stop-color="#f2d39b" stop-opacity="0"/></radialGradient>
    ${lights('blue','#8ec2e2')}${lights('red','#efac98')}
    <clipPath id="shelter-rain-clip"><path id="shelter-rain-boundary" d="M0 0H1100V570H970V260L550 95V570H550V95L130 260V570H0Z"/></clipPath>
   </defs>
   <path class="shelter-ground" d="M80 480H1020"/>
   ${room('blue',275)}${room('red',825)}
   <g id="shelter-common">
    <path d="M550 240L690 480Q550 542 410 480Z" fill="url(#shelter-common-beam)"/>
    <ellipse id="shelter-reflection" cx="550" cy="482" rx="180" ry="73" fill="url(#shelter-common-floor)"/>
    <ellipse class="shelter-common-boundary" cx="550" cy="480" rx="124" ry="48"/>
    <path class="shelter-pendant shared" d="M550 147V273"/>
    <circle id="shelter-lamp-halo" cx="550" cy="280" r="53" fill="url(#shelter-common-lamp)"/>
    <path class="shelter-lantern" d="M542 276L550 269L558 276L550 287Z"/>
    <ellipse class="shelter-seat-shadow" cx="500" cy="489" rx="28" ry="6"/><ellipse class="shelter-seat-shadow" cx="600" cy="489" rx="28" ry="6"/>
    <path class="shelter-seats blue" d="M480 467L520 456L520 466L480 477ZM480 477V491M520 466V480"/>
    <path class="shelter-seats red" d="M580 456L620 467L620 477L580 466ZM580 466V480M620 477V491"/>
   </g>
   ${wing('blue',130,225)}${wing('red',970,875)}
   <path id="shelter-runnels"/>
   <path id="shelter-seam" d="M550 95V147"/>
   <g clip-path="url(#shelter-rain-clip)"><path id="shelter-rain-far"/><path id="shelter-rain" d="M90 80v17M171 110v22M266 60v18M387 35v20M496 48v17M612 30v22M724 60v16M830 80v20M960 100v16M1010 290v18"/></g>
   <path id="shelter-drops"/><path id="shelter-drips"/><g id="shelter-ripples"><path/><path/></g>
  </svg>
  <span class="shelter-label blue"><strong>我</strong><small>我的空间</small></span>
  <span class="shelter-label red"><strong>你</strong><small>你的空间</small></span>
  <span class="shelter-label shared" id="shelter-shared-label"><strong>我们</strong><small>一起避雨的地方</small></span>
  <span class="shelter-gap" id="shelter-gap">中间，还没有落脚的地方</span>
  <span class="shelter-action"><span id="shelter-action-text">轻触，一起撑起屋檐</span><svg viewBox="0 0 26 20" aria-hidden="true"><path d="M2 13L13 4L24 13M7 12V18M19 12V18"/></svg></span>
 </button>
 <div class="shelter-caption"><span>安全的联结</span><p id="shelter-status" role="status">你有你的空间，我有我的空间</p><small>文章意象 · 互动示意</small></div>
 <noscript><style>.shelter-action,.shelter-gap{display:none}.shelter-label.shared{opacity:1!important}</style></noscript>
</div>`;
