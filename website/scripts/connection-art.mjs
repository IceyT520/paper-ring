const surface=(side,x)=>`<g class="lens-surface ${side}" id="lens-${side}" transform="translate(${x} 220)">
 <circle class="lens-halo" r="192"/>
 <circle class="lens-body" r="190" fill="url(#lens-paper-${side})"/>
 <circle class="lens-edge" r="190" stroke="url(#lens-edge-${side})"/>
 <circle class="lens-inner-edge" r="186"/>
 <path class="lens-shine" d="M-164.5 -95 A190 190 0 0 1 95 -164.5"/>
</g>`;
export const mirrorInstallation=`
<div id="mirror-installation" class="mirror-installation lens-installation" data-connected="false" role="group" aria-label="不能失去自己，不能没有你：两种需要之间的安全联结">
 <div class="connection-voices">
  <div class="connection-voice blue"><span>回避 · 害怕被吞没</span><strong data-voice="blue">不能失去自己</strong><small>我需要自己的空间</small></div>
  <div class="connection-voice red"><span>焦虑 · 害怕被抛弃</span><strong data-voice="red">不能没有你</strong><small>我需要确定你在</small></div>
 </div>
 <button id="connection-meet" class="lens-stage" aria-label="轻触，让两个空间相遇" aria-describedby="lens-status" disabled>
  <svg class="lens-art" viewBox="0 0 1100 480" aria-hidden="true">
   <defs>
    <radialGradient id="lens-paper-blue" cx=".35" cy=".28" r=".8"><stop stop-color="#b3d6e4" stop-opacity=".24"/><stop offset=".52" stop-color="#72b7ef" stop-opacity=".09"/><stop offset="1" stop-color="#467896" stop-opacity=".16"/></radialGradient>
    <radialGradient id="lens-paper-red" cx=".65" cy=".28" r=".8"><stop stop-color="#e9b4a5" stop-opacity=".24"/><stop offset=".52" stop-color="#ee8a80" stop-opacity=".09"/><stop offset="1" stop-color="#a96675" stop-opacity=".16"/></radialGradient>
    <linearGradient id="lens-edge-blue" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#d1e6e6" stop-opacity=".85"/><stop offset=".45" stop-color="#83b7d4" stop-opacity=".5"/><stop offset="1" stop-color="#6da6cf" stop-opacity=".13"/></linearGradient>
    <linearGradient id="lens-edge-red" x1="1" y1="0" x2=".3" y2="1"><stop stop-color="#f1d8c3" stop-opacity=".85"/><stop offset=".45" stop-color="#dba397" stop-opacity=".5"/><stop offset="1" stop-color="#c77f89" stop-opacity=".13"/></linearGradient>
    <radialGradient id="lens-warmth"><stop stop-color="#eed3a0" stop-opacity=".5"/><stop offset=".65" stop-color="#d3b186" stop-opacity=".28"/><stop offset="1" stop-color="#e8d4b5" stop-opacity=".15"/></radialGradient>
   </defs>
   ${surface('blue',430)}${surface('red',670)}
   <path id="lens-shared" d="M550 72.69 A190 190 0 0 1 550 367.31 A190 190 0 0 1 550 72.69Z" fill="url(#lens-warmth)"/>
  </svg>
  <span class="lens-label blue" id="lens-blue-label"><strong>我</strong><small>我的空间</small></span>
  <span class="lens-label red" id="lens-red-label"><strong>你</strong><small>你的空间</small></span>
  <span class="lens-label shared" id="lens-shared-label"><strong>我们</strong><small>共同空间</small></span>
  <span class="lens-action"><span id="lens-action-text">轻触，让两个空间相遇</span><i aria-hidden="true">↔</i></span>
 </button>
 <div class="lens-caption"><span>安全的联结</span><p id="lens-status" role="status">亲近，也各自完整</p><small>文章意象 · 互动示意</small></div>
 <noscript><style>.lens-installation .lens-action{display:none}.lens-installation .lens-stage{aspect-ratio:1100/480}.lens-installation .lens-label{font-size:12px}.lens-installation .lens-label strong{font-size:20px}</style></noscript>
</div>`;
