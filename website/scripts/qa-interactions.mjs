import {devUrlNoGate} from './paths.mjs';
import {settleOpening} from './browser.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const checks=[];
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name)}
const near=async(page,selector)=>{await page.evaluate(s=>scrollTo({top:document.querySelector(s).getBoundingClientRect().top+scrollY-(s==='#mobius-section'?0:120),behavior:'instant'}),selector);await page.waitForTimeout(350)};
try{
 for(const [width,height] of [[1440,1000],[390,844],[360,800],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<760}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__glDraws=0;for(const ctor of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!ctor)continue;for(const key of ['drawElements','drawArrays']){const original=ctor.prototype[key];ctor.prototype[key]=function(...args){window.__glDraws++;return original.apply(this,args)}}}});
  await page.goto(devUrlNoGate,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await settleOpening(page);
  await check(`${width}: no narrative sliders, complete text and corrected headings`,async()=>{
   assert.equal(await page.locator('#need-volume,#signal-delay,#rhythm-range,#twist-range').count(),0);
   assert.equal(await page.locator('#exhibition [data-original]').count(),71);
   assert.equal(await page.locator('#chapter-10 h2').textContent(),'回到爱的本身');
   assert.equal(await page.locator('.large-quote').first().evaluate(el=>getComputedStyle(el,'::before').content),'none');
  });
  await check(`${width}: throw, retrieve and keyboard-send the paper letter`,async()=>{
   await near(page,'.study-delay');const rect=await page.locator('#send-signal').boundingBox();
   await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+70,rect.y+rect.height/2-20,{steps:8});await page.mouse.up();
   await page.waitForTimeout(2300);assert(await page.locator('.letter-flight').evaluate(e=>e.classList.contains('arrived')));
   assert((await page.locator('#signal-status').textContent()).includes('回应仍是一个未知'));
   await page.screenshot({path:`test-results/v4-letter-sent-${width}.png`});
   await page.locator('#signal-reset').click();assert(!await page.locator('.letter-flight').evaluate(e=>e.classList.contains('sent')));
   await page.locator('#send-signal').focus();await page.keyboard.press('Enter');await page.waitForTimeout(2300);
   assert(await page.locator('.letter-flight').evaluate(e=>e.classList.contains('arrived')));
  });
  await check(`${width}: calls accumulate; a response gathers the same fragments`,async()=>{
   await near(page,'.anxious-instrument');
   for(let i=0;i<8;i++)await page.locator('#call-need').click();
   assert.equal(await page.locator('#echo-words span').count(),6);assert.equal(await page.locator('.disc-word').textContent(),'别推我走');
   await page.waitForTimeout(600);await page.screenshot({path:`test-results/v4-echo-full-${width}.png`});
   await page.locator('#answer-need').click();assert.equal(await page.locator('.disc-word').textContent(),'我听见了');
   await page.waitForTimeout(1400);assert(await page.locator('#echo-words span').evaluateAll(els=>els.every(el=>Number(getComputedStyle(el).opacity)<.01)));
   await page.locator('#call-need').click();assert.equal(await page.locator('#echo-words span').count(),1);assert.equal(await page.locator('#answer-need').getAttribute('aria-pressed'),'false');
  });
  await check(`${width}: individual promises, all four stitches, undo and reset`,async()=>{
   await near(page,'.rhythm-instrument');const red=await page.locator('#rhythm-red').getAttribute('d'),blue=await page.locator('#rhythm-blue').getAttribute('d');
   for(let i=0;i<4;i++)await page.locator(`[data-promise="${i}"]`).click();
   assert.equal(await page.locator('.promise-stitch.sewn').count(),4);assert.equal(await page.locator('#promise-count').textContent(),'04 / 04');
   assert.equal(await page.locator('#rhythm-red').getAttribute('d'),red);assert.equal(await page.locator('#rhythm-blue').getAttribute('d'),blue);assert.notEqual(red,blue);
   await page.waitForTimeout(1100);await page.screenshot({path:`test-results/v4-loom-complete-${width}.png`});
   await page.locator('[data-promise="2"]').click();assert.equal(await page.locator('.promise-stitch.sewn').count(),3);
   await page.locator('#promise-reset').click();assert.equal(await page.locator('.promise-stitch.sewn').count(),0);
  });
  await check(`${width}: touch actual paper, orbit, pause and reduced-motion light journey`,async()=>{
   await near(page,'#mobius-section');await page.locator('#mobius-settings').evaluate(e=>e.open=true);await page.locator('[data-twist-step="2"]').click();await page.waitForFunction(()=>document.querySelector('#mobius-stage').dataset.paperProgress==='1');
   await page.waitForTimeout(1900); // let the morph settle before tapping the surface
   const stage=page.locator('#mobius-stage');assert.equal(await stage.getAttribute('data-paper-progress'),'1');
   await stage.focus();await page.keyboard.press('ArrowRight');assert(JSON.parse(await stage.getAttribute('data-view')).x>.1);await page.locator('#reset-paper-view').click();assert.deepEqual(JSON.parse(await stage.getAttribute('data-view')),{x:0,y:0});
   await page.evaluate(()=>document.querySelector('#mobius-stage').addEventListener('paper-touch',()=>document.querySelector('#mobius-stage').dataset.touched='yes'));
   await stage.scrollIntoViewIfNeeded();
   const r=await stage.boundingBox();let touched=false;
   for(const y of [.2,.3,.4,.5,.6]){for(const x of [.4,.5,.6,.7,.8,.9]){
    const px=r.x+r.width*x,py=r.y+r.height*y;if(px<0||px>width||py<90||py>height-100)continue;
    if(width<760)await page.touchscreen.tap(px,py);else await page.mouse.click(px,py);
    touched=await stage.getAttribute('data-touched')==='yes';if(touched)break;
   }if(touched)break}
   assert(touched,'surface raycast should accept a real tap');await page.waitForTimeout(4600);
   assert.equal(await stage.getAttribute('data-paper-progress'),'1');assert.equal(await stage.getAttribute('data-light-journey'),'0');
   await page.locator('#trace-pause').click();await page.waitForTimeout(100);assert.equal(await stage.getAttribute('data-trace-state'),'paused');
   if(width===1440){const a=await page.evaluate(()=>window.__glDraws);await page.waitForTimeout(400);const b=await page.evaluate(()=>window.__glDraws);assert.equal(b,a,'pausing stops WebGL draw calls');}
   await page.locator('#send-light').click();await page.waitForTimeout(300);assert.equal(await stage.getAttribute('data-trace-state'),'running');
   if(width===1440){await page.waitForTimeout(5500);assert.equal(await stage.getAttribute('data-light-journey'),'0','light stays on its first lap for more than ten seconds');await page.waitForTimeout(7200);assert.equal(await stage.getAttribute('data-light-journey'),'1');await page.waitForTimeout(12000);assert.equal(await stage.getAttribute('data-light-journey'),'2');}
   await page.screenshot({path:`test-results/v4-mobius-light-${width}.png`});
   await page.locator('#motion-toggle').click();await page.locator('#send-light').click();await page.waitForTimeout(120);
   assert.equal(await stage.getAttribute('data-light-journey'),'2');
   assert.equal(await stage.getAttribute('data-paper-progress'),'1');
   if(width===1440){await near(page,'#chapter-10');const a=await page.evaluate(()=>window.__glDraws);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__glDraws),a,'offscreen renderer stops');}
  });
  await check(`${width}: reduced-motion direct actions and no layout overflow or errors`,async()=>{
   await near(page,'.study-delay');await page.locator('#signal-reset').click();await page.locator('#send-signal').click();assert(await page.locator('.letter-flight').evaluate(e=>e.classList.contains('arrived')));
   await page.locator('#wall-perspective').click();assert(await page.locator('.wall-art').evaluate(el=>el.classList.contains('inside-view')));
   await page.locator('#cave-lamp').click();assert.equal(await page.locator('#cave-lamp').getAttribute('aria-pressed'),'true');
   assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  });
  await context.close();
 }
 fs.writeFileSync('test-results/interaction-report.json',JSON.stringify({passed:checks.length,checks},null,2));
}finally{await browser.close()}
