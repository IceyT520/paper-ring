import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {devUrl,devUrlNoGate} from './paths.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const reports=[];
const url=devUrl;
fs.mkdirSync('test-results',{recursive:true});
async function check(name,fn){await fn();reports.push(name);console.log('PASS',name)}
function silentWav(seconds=.6,rate=8000){
 const n=Math.floor(seconds*rate),buf=Buffer.alloc(44+n);
 buf.write('RIFF',0);buf.writeUInt32LE(36+n,4);buf.write('WAVE',8);buf.write('fmt ',12);
 buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);
 buf.writeUInt32LE(rate,28);buf.writeUInt16LE(1,32);buf.writeUInt16LE(8,34);buf.write('data',36);buf.writeUInt32LE(n,40);
 buf.fill(128,44);return buf;
}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // No soundtrack ships with the repo: answer the request with silence so the
 // control, the gesture unlock and the stored preference can be exercised.
 await page.route('**/theme.mp3',route=>route.fulfill({status:200,contentType:'audio/wav',body:silentWav()}));
 await page.goto(devUrlNoGate,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 await check('soundtrack: control appears with a track, starts on gesture, remembers off',async()=>{
  await page.locator('#sound-toggle').waitFor({state:'visible',timeout:5000});
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'true');
  await page.locator('#sound-toggle').click();
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
  assert.equal(await page.evaluate(()=>localStorage.getItem('paper-sound')),'off');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
  await page.locator('#sound-toggle').click();
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.audio),'playing');
 });
 await check('envelope gate: one click opens the letter, the opening and the track',async()=>{
  const fresh=await browser.newContext({viewport:{width:1440,height:1000}});
  const sealed=await fresh.newPage();
  await sealed.route('**/theme.mp3',route=>route.fulfill({status:200,contentType:'audio/wav',body:silentWav()}));
  await sealed.goto(url,{waitUntil:'load'});
  await sealed.locator('#gate').waitFor({state:'visible'});
  assert.equal(await sealed.evaluate(()=>document.documentElement.dataset.gate),'sealed');
  await sealed.locator('#gate-open').click();
  await sealed.waitForTimeout(1300);
  assert(await sealed.locator('#gate').isHidden(),'the envelope must leave after the seal breaks');
  assert.equal(await sealed.evaluate(()=>document.documentElement.dataset.opening),'running');
  assert.equal(await sealed.evaluate(()=>document.documentElement.dataset.audio),'playing');
  assert.equal(await sealed.evaluate(()=>scrollY),0);
  await fresh.close();
 });
 await check('static article: 12 chapters, 71 full-text blocks, local fonts and PDF',async()=>{
  assert.equal(await page.locator('#exhibition > .chapter').count(),12);
  assert.equal(await page.locator('#exhibition [data-original]').count(),71);
  assert.equal((await page.request.get(url+'paper.pdf')).status(),200);
  assert.equal(await page.evaluate(()=>document.fonts.status),'loaded');
 });
 await check('reduced-motion preference; live motion toggle',async()=>{
  assert(await page.locator('body').evaluate(el=>el.classList.contains('reduced-motion')));
  await page.locator('#motion-toggle').click();assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');
  await page.locator('#motion-toggle').click();assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'true');
 });
 await check('chapter dialog opens, traps focus, closes with Escape and navigates',async()=>{
  await page.locator('#menu-toggle').click();assert(await page.locator('#chapter-menu').isVisible());
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#chapter-menu')!==null));
  await page.keyboard.press('Escape');assert(!await page.locator('#chapter-menu').isVisible());
  await page.locator('#menu-toggle').click();await page.locator('#chapter-menu a[href="#chapter-06"]').click();
  assert(!await page.locator('#chapter-menu').isVisible());assert.equal(new URL(page.url()).hash,'#chapter-06');
 });
 await check('original statements stay; shared space, coin, peel and fear filter respond',async()=>{
  await page.locator('#connection-meet').click();
  assert.equal(await page.locator('#mirror-installation').getAttribute('data-connected'),'true');
  assert.deepEqual(await page.locator('#mirror-installation [data-voice]').allTextContents(),['不能失去自己','不能没有你']);
  await page.locator('#paper-coin').click();assert(await page.locator('#paper-coin').evaluate(e=>e.classList.contains('flipped')));
  await page.locator('#peel-button').click();assert.equal(await page.locator('#peel-text').textContent(),'我很害怕，我需要你。');
  await page.locator('#peel-button').click();assert.equal(await page.locator('#peel-text').textContent(),'求你拉住我，别推我走。');
  await page.locator('#filter-toggle').click();assert.equal(await page.locator('#filter-toggle').getAttribute('aria-pressed'),'true');
 });
 await check('pursuit/reset and all three pairs of subtitles',async()=>{
  await page.locator('#pursue').click();await page.locator('#pursue').click();assert.equal(await page.locator('#pursuit-count').textContent(),'第 2 次追问');
  await page.locator('#pursue-reset').click();assert.equal(await page.locator('#pursuit-count').textContent(),'尚未追问');
  await page.locator('[data-subtitle="2"]').click();assert.equal(await page.locator('#subtitle-avd').textContent(),'你在摧毁我的边界');
 });
 await check('six-step loop unveils, counts a full cycle, pauses and resets',async()=>{
  await page.locator('#unveil-distance').click();assert(await page.locator('#distance-shield').evaluate(e=>e.classList.contains('unveiled')));
  for(let i=0;i<6;i++)await page.locator('#loop-next').click();assert.equal(await page.locator('#loop-count').textContent(),'01');
  await page.locator('#loop-play').click();await page.locator('#loop-play').click();
  const value=await page.locator('#loop-description').textContent();await page.waitForTimeout(1900);assert.equal(await page.locator('#loop-description').textContent(),value);
  await page.locator('#loop-reset').click();assert.equal(await page.locator('#loop-count').textContent(),'00');
 });
 await check('simulation opens at the critical distance, then grows or settles',async()=>{
  assert.equal(await page.locator('#critical-value').textContent(),'9.00');
  assert((await page.locator('#sim-status').textContent()).startsWith('临界'),'default view must be the critical regime');
  assert.equal(await page.locator('[data-equilibrium="line"]').count(),1);
  const atRest=Number(await page.locator('#time-chart').getAttribute('data-max'));assert(atRest<=1.5,`critical view ${atRest}`);
  await page.locator('[data-preset="growth"]').click();
  assert.equal(await page.locator('#critical-value').textContent(),'9.00');
  assert(Number(await page.locator('#time-chart').getAttribute('data-max'))>1,'the growth preset still leaves [0,1]');
  await page.locator('[data-preset="critical"]').click();
  await page.locator('[data-model="bounded"]').click();assert(Number(await page.locator('#time-chart').getAttribute('data-max'))<=1);
  await page.locator('#sim-reset').click();assert.equal(await page.locator('#value-D').textContent(),'9.00');
 });
 await check('communication exercise and copyable original sentence',async()=>{
  await page.locator('#practice-reframe').click();assert(await page.locator('#practice-feedback').isVisible());
  await page.locator('[data-copy]').click();assert((await page.evaluate(()=>navigator.clipboard.readText())).includes('明天我们再好好聊'));
 });
 await check('source-location links preserve exact reading position in both directions',async()=>{
  await page.locator('#p036 [data-locate]').click();assert(await page.locator('#source-reader').isVisible());
  assert(await page.locator('#exhibition').isHidden());
  let y=await page.locator('#reader-p036').evaluate(el=>el.getBoundingClientRect().top);assert(y>=60&&y<250,`reader position ${y}`);
  await page.locator('#reader-p036 [data-locate]').click();assert(await page.locator('#source-reader').isHidden());
  y=await page.locator('#p036').evaluate(el=>el.getBoundingClientRect().top);assert(y>=60&&y<250,`exhibition position ${y}`);
 });
 await check('reading never creates a bookmark; legacy bookmark is discarded',async()=>{
  await page.waitForTimeout(1300);assert.equal(await page.evaluate(()=>localStorage.getItem('paper-bookmark')),null);
  await page.evaluate(()=>localStorage.setItem('paper-bookmark',JSON.stringify({id:'p036',mode:false})));
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#resume-toast').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('paper-bookmark')),null);
 });
 await check('no runtime exceptions',async()=>assert.deepEqual(errors,[]));
 await context.close();
 for(const [width,height] of [[360,800],[390,844],[768,1024],[1920,1080]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto(devUrlNoGate,{waitUntil:'networkidle'});
  await check(`responsive ${width}px: no horizontal overflow, navigation accessible`,async()=>{
   const layout=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,inner:innerWidth}));
   assert(layout.scroll<=width+1,JSON.stringify(layout));
   await page.locator('#menu-toggle').click();await page.locator('#chapter-menu a[href="#chapter-08"]').click();
   const box=await page.locator('#simulator').boundingBox();assert(box.width<=width);
   await page.locator('[data-preset="critical"]').click();assert.equal(await page.locator('[data-equilibrium="line"]').count(),1);
  });
  if(width===390){await page.screenshot({path:'test-results/mobile-sandbox.png'});await page.goto(devUrlNoGate,{waitUntil:'networkidle'});await page.screenshot({path:'test-results/mobile-final.png'})}
  await context.close();
 }
 await check('JavaScript disabled: all 71 source blocks remain readable',async()=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(devUrlNoGate);
  assert.equal(await page.locator('#exhibition [data-original]').count(),71);assert(await page.locator('#p023').isVisible());assert(await page.locator('#p065').isVisible());await context.close();
 });
 await check('WebGL unavailable: static paper fallback and working interactions',async()=>{
  const context=await browser.newContext();await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).includes('webgl'))return null;return get.call(this,type,...args)}});
  const page=await context.newPage();await page.goto(devUrlNoGate,{waitUntil:'networkidle'});await page.waitForTimeout(1500);
  assert(await page.locator('#hero-stage .ring-fallback').isVisible());await page.locator('#peel-button').click();assert((await page.locator('#peel-text').textContent()).includes('我很害怕'));await context.close();
 });
 fs.writeFileSync('test-results/browser-report.json',JSON.stringify({passed:reports.length,checks:reports},null,2));
 console.log(`All ${reports.length} browser checks passed.`);
}finally{await browser.close()}
