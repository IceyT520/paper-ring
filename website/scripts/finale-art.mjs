export const finaleEntry=`<button id="watch-finale" class="finale-entry"><span class="finale-entry-mark" aria-hidden="true">↗</span><span>让连接铺满此刻<small>可选 · 独立放映 · 22 秒</small></span></button>`;
export const finaleDialog=`<dialog id="connection-film" class="connection-film" tabindex="-1" aria-labelledby="finale-title" aria-describedby="finale-accessible">
 <div class="finale-lightfield" aria-hidden="true"><i></i><i></i><i></i></div>
 <div class="finale-horizon" aria-hidden="true"></div>
 <header class="finale-header"><span>纸环的两面 <i>/</i> 连接的另一种可能</span><button id="finale-close" autofocus>回到文章 <span aria-hidden="true">×</span></button></header>
 <div id="finale-stage" class="finale-stage" data-stage="finale" aria-hidden="true">
  <svg class="finale-fallback" viewBox="0 0 800 600" fill="none"><defs><linearGradient id="finale-paper"><stop stop-color="#6f8394"/><stop offset=".38" stop-color="#dddcd7"/><stop offset=".72" stop-color="#969b9f"/><stop offset="1" stop-color="#c4baba"/></linearGradient></defs><path d="M176 316C85 98 499 115 615 258C737 410 381 480 240 340C136 235 318 167 471 210C650 260 617 410 419 420C236 429 138 364 176 316Z" stroke="url(#finale-paper)" stroke-width="45"/><path d="M176 316C85 98 499 115 615 258C737 410 381 480 240 340C136 235 318 167 471 210C650 260 617 410 419 420C236 429 138 364 176 316Z" stroke="#c6d8df" stroke-width="1.2"/></svg>
 </div>
 <div class="finale-caption"><span id="finale-chapter">01 / 两面</span><h2 id="finale-title">同一张纸<br><span class="finale-blue">你的世界</span>，<span class="finale-red">我的世界</span></h2><p id="finale-description">我们曾以为，彼此在无法抵达的两面。</p></div>
 <p id="finale-accessible" class="sr-only">纸环打开接缝，一端扭转半圈，再连接成莫比乌斯环。一束光沿同一个表面经过曾经的两面，最终回到起点。可暂停、重播，或按 Escape 回到文章。</p>
 <footer class="finale-footer"><button id="finale-pause" aria-pressed="false">暂停放映</button><button id="finale-replay">从头重播 <span aria-hidden="true">↺</span></button><span id="finale-time" aria-hidden="true">00 / 22</span><div class="finale-progress" aria-hidden="true"><i></i></div></footer>
</dialog>`;
