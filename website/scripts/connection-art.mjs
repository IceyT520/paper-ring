const wing=(side,outer,tip)=>`<g class="shelter-wing ${side}" id="shelter-${side}">
 <path class="shelter-paper" d="M${outer} 260L550 95L550 147L${tip} 311Z" fill="url(#shelter-paper-${side})"/>
 <path class="shelter-fold" d="M${outer} 260L550 147L${tip} 311Z"/>
 <path class="shelter-edge" d="M${outer} 260L550 95L550 147L${tip} 311Z"/>
 <path class="shelter-grain"/>
 <path class="shelter-memory"/>
 <path class="shelter-crease" d="M${outer} 260L550 147"/>
</g>`;
// These furnishings are part of the illustration, not extra interaction steps.
const chair=(side,x)=>`<g class="shelter-chair ${side}" transform="translate(${x} 394) scale(${side==='blue'?1:-1} 1)">
 <ellipse class="shelter-object-shadow" cx="39" cy="101" rx="45" ry="9"/>
 <path class="chair-legs" d="M14 53L10 86M52 48L55 78M30 76L27 101M68 69L72 94"/>
 <path class="chair-back" d="M6 8Q6 2 12 1L43 -4Q50 -5 51 3L55 47L10 53Z"/>
 <path class="chair-back-inset" d="M14 12L43 7L47 35L17 40Z"/>
 <path class="chair-seat" d="M10 48L55 42L73 62L27 70Z"/>
 <path class="chair-seat-front" d="M27 70L73 62V69L27 77ZM10 48L27 70V77L10 55Z"/>
 <path class="chair-seat-seam" d="M17 49L54 44L67 60L30 67Z"/>
</g>`;
const desk=`<g class="shelter-desk" transform="translate(206 402)">
 <ellipse class="shelter-object-shadow" cx="69" cy="94" rx="82" ry="12"/>
 <path class="desk-legs" d="M18 31L12 94M117 34L126 94M91 16L94 76"/>
 <path class="desk-front" d="M4 20L40 36L136 22V29L40 43L4 27Z"/>
 <path class="desk-top" d="M4 20L100 6L136 22L40 36Z"/>
 <path class="desk-drawer" d="M45 44L112 34V50L45 60Z"/>
 <path class="desk-handle" d="M72 46L85 44"/>
 <path class="desk-stool-legs" d="M58 75L54 96M83 70L88 94M69 65V85"/>
 <path class="desk-stool" d="M48 69L75 63L93 72L66 79Z"/>
 <path class="desk-book-left" d="M47 8L67 11L81 24L60 20Z"/>
 <path class="desk-book-right" d="M67 11L84 1L98 14L81 24Z"/>
 <path class="desk-book-fold" d="M67 11L81 24M52 12L64 14M56 16L68 18M76 11L85 6M80 15L89 10"/>
</g>`;
const plant=`<g class="shelter-plant" transform="translate(825 496)">
 <ellipse class="shelter-object-shadow" cx="0" cy="2" rx="44" ry="10"/>
 <path class="plant-stems" d="M0 -42Q-2 -85 3 -128M0 -60Q-17 -83 -32 -93M1 -80Q26 -101 40 -109M2 -106Q-15 -119 -23 -133"/>
 <path class="plant-leaf dark" d="M-1 -70C-28 -71 -47 -89 -47 -108C-20 -112 -4 -92 -1 -70Z"/>
 <path class="plant-leaf" d="M3 -94C14 -121 32 -132 53 -125C51 -101 30 -91 3 -94Z"/>
 <path class="plant-leaf light" d="M3 -118C-18 -116 -34 -133 -29 -153C-7 -154 5 -141 3 -118Z"/>
 <path class="plant-leaf" d="M1 -54C17 -78 40 -83 55 -72C45 -49 24 -47 1 -54Z"/>
 <path class="plant-veins" d="M-1 -70L-37 -100M3 -94L42 -119M3 -118L-23 -145M1 -54L45 -69"/>
 <path class="plant-pot" d="M-26 -43L-19 -2Q0 7 19 -2L26 -43Z"/>
 <path class="plant-pot-shade" d="M5 -41L4 4Q14 3 19 -2L26 -43Z"/>
 <ellipse class="plant-pot-rim" cx="0" cy="-43" rx="26" ry="8"/>
 <path class="plant-pot-stem" d="M0 -43V-52"/>
</g>`;
const room=(side,x)=>`<g class="shelter-room ${side}" data-private="${side}">
 <path d="M${x-62} 250L${x+62} 250L${x+138} 480Q${x} 540 ${x-138} 480Z" fill="url(#shelter-beam-${side})"/>
 <ellipse cx="${x}" cy="482" rx="140" ry="48" fill="url(#shelter-floor-${side})"/>
 <path class="shelter-deck ${side}" d="${side==='blue'?'M190 448H420L400 514H155Z':'M680 448H910L945 514H700Z'}"/>
 <path class="shelter-deck-edge" d="${side==='blue'?'M155 514H400V520H155Z':'M700 514H945V520H700Z'}"/>
 <path class="shelter-pendant" d="M${x} 270V313"/>
 <circle cx="${x}" cy="317" r="24" fill="url(#shelter-lamp-${side})"/>
 <circle cx="${x}" cy="317" r="3" fill="currentColor"/>
 ${side==='blue'?desk:plant}
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
  <svg class="shelter-art" viewBox="0 60 1100 640" preserveAspectRatio="none" aria-hidden="true">
   <defs>
    <linearGradient id="shelter-paper-blue" x1="0" y1="1" x2=".7" y2="0"><stop stop-color="#1e3d53"/><stop offset=".52" stop-color="#5b8297"/><stop offset=".98" stop-color="#c4d9d5"/></linearGradient>
    <linearGradient id="shelter-paper-red" x1="1" y1="1" x2=".3" y2="0"><stop stop-color="#53333b"/><stop offset=".52" stop-color="#ac7972"/><stop offset=".98" stop-color="#e9cabb"/></linearGradient>
    <linearGradient id="shelter-common-beam" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1d9a4" stop-opacity="0"/><stop offset=".35" stop-color="#f1d9a4" stop-opacity=".015"/><stop offset="1" stop-color="#f1d9a4" stop-opacity=".16"/></linearGradient>
    <radialGradient id="shelter-common-floor"><stop stop-color="#f4d39c" stop-opacity=".35"/><stop offset=".65" stop-color="#d7ae75" stop-opacity=".12"/><stop offset="1" stop-color="#d7ae75" stop-opacity="0"/></radialGradient>
    <radialGradient id="shelter-common-lamp"><stop stop-color="#fff0c9" stop-opacity=".5"/><stop offset=".16" stop-color="#f2d39b" stop-opacity=".16"/><stop offset="1" stop-color="#f2d39b" stop-opacity="0"/></radialGradient>
    ${lights('blue','#8ec2e2')}${lights('red','#efac98')}
    <clipPath id="shelter-rain-clip"><path id="shelter-rain-boundary" d="M0 0H1100V570H970V260L550 95V570H550V95L130 260V570H0Z"/></clipPath>
   </defs>
   ${room('blue',275)}${room('red',825)}
   <g id="shelter-common">
    <path d="M550 280L700 514Q550 550 400 514Z" fill="url(#shelter-common-beam)"/>
    <ellipse id="shelter-reflection" cx="550" cy="482" rx="180" ry="73" fill="url(#shelter-common-floor)"/>
    <path class="shelter-deck shared" d="M420 448H680L700 514H400Z"/>
    <path class="shelter-deck-edge shared" d="M400 514H700V520H400Z"/>
    <path class="shelter-pendant shared" d="M550 147V273"/>
    <circle id="shelter-lamp-halo" cx="550" cy="280" r="53" fill="url(#shelter-common-lamp)"/>
    <path class="shelter-lantern" d="M542 276L550 269L558 276L550 287Z"/>
    ${chair('blue',446)}${chair('red',654)}
    <g class="shelter-table">
     <ellipse class="shelter-object-shadow" cx="550" cy="497" rx="30" ry="7"/>
     <path class="table-stem" d="M550 461V490"/>
     <ellipse class="table-foot" cx="550" cy="491" rx="15" ry="4"/>
     <path class="table-edge" d="M525 454V459C525 470 575 470 575 459V454"/>
     <ellipse class="table-top" cx="550" cy="454" rx="25" ry="9"/>
     <g class="table-cup blue"><path d="M535 443H544V451Q539.5 455 535 451Z"/><path class="cup-handle" d="M544 445Q550 444 549 448Q548 451 544 449"/></g>
     <g class="table-cup red"><path d="M555 439H564V447Q559.5 451 555 447Z"/><path class="cup-handle" d="M564 441Q570 440 569 444Q568 447 564 445"/></g>
    </g>
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
