import assert from 'node:assert/strict';
import {launchBrowser} from './browser.mjs';
import {offlineUrlNoGate,devUrlNoGate} from './paths.mjs';
const url=process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate;
const browser=await launchBrowser();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(url+'#mobius-section',{waitUntil:'load'});
 await page.waitForSelector('#mobius-stage.ready');
 assert(await page.locator('#send-light').isVisible(),'the light action remains visible before connection');
 assert.equal(await page.locator('#mobius-settings').count(),0,'Möbius explanations and controls are never collapsed');
 await page.locator('#mobius-section').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));
 await page.waitForTimeout(150);
 const progress=await page.locator('#mobius-stage').getAttribute('data-paper-progress'),y=await page.evaluate(()=>scrollY);
 await page.mouse.wheel(0,400);await page.waitForTimeout(400);
 assert(await page.evaluate(()=>scrollY)>y+100,'readers can scroll past an unfinished connection');
 assert.equal(await page.locator('#mobius-stage').getAttribute('data-paper-progress'),progress,'scrolling must not advance the shape');
 await page.locator('#mobius-continue').click();
 await page.waitForFunction(()=>document.querySelector('#chapter-10').getBoundingClientRect().top<innerHeight);
 await page.close();
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:width<760?844:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'#chapter-09',{waitUntil:'load'});
  assert.equal(await page.locator('#buffer-scene,#buffer-offer').count(),0,'the return-time animation is removed');
  const before=await page.locator('#practice-phrase').textContent();
  await page.locator('#practice-reframe').click();assert.notEqual(await page.locator('#practice-phrase').textContent(),before);
  assert(await page.locator('[data-twist-step="2"]').isVisible());
  await page.locator('[data-twist-step="2"]').click();
  assert(await page.locator('#send-light').isVisible());
  const geometry=await page.evaluate(()=>{
   const scene=document.querySelector('.mobius-sticky').getBoundingClientRect(),description=document.querySelector('#twist-description').getBoundingClientRect(),touch=document.querySelector('.mobius-touch').getBoundingClientRect();
   const words=[...document.querySelectorAll('.mobius-steps strong')].map(el=>el.getBoundingClientRect());
   return{gap:touch.top-description.bottom,inside:words.every(r=>r.top>=scene.top&&r.bottom<=scene.bottom)};
  });
  assert(geometry.inside,'all three step descriptions stay inside the scene');
  if(width<760)assert(geometry.gap>=16,`mobile description needs space before the light action: ${geometry.gap}`);
  assert.equal(await page.locator('#exhibition [data-original]').count(),71);
  assert.equal(await page.locator('#source-reader [data-original]').count(),71);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}: expanded Möbius controls, full content and no overflow`);
  await page.close();
 }
 const pageSound=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await pageSound.goto(url+'#chapter-08',{waitUntil:'load'});
 await pageSound.locator('#p046').scrollIntoViewIfNeeded();
 await pageSound.mouse.click(1400,550);
 await pageSound.waitForFunction(()=>{const a=document.querySelector('#theme-audio');return a&&!a.paused&&Math.abs(a.volume-.3)<.001});
 const level=()=>pageSound.locator('#theme-audio').evaluate(a=>a.volume);
 for(const selector of ['#mobius-stage','.dedication-end','#p046']){
  await pageSound.locator(selector).scrollIntoViewIfNeeded();await pageSound.waitForTimeout(600);
  assert(Math.abs(await level()-.3)<.001,'chapter changes keep the original music volume');
 }
 await pageSound.locator('#sound-toggle').click();
 await pageSound.waitForFunction(()=>document.querySelector('#theme-audio').paused);
 await pageSound.locator('#p046').scrollIntoViewIfNeeded();await pageSound.waitForTimeout(350);
 assert(await pageSound.locator('#theme-audio').evaluate(a=>a.paused),'scene changes must respect mute');
 console.log('PASS original music volume stays constant and mute remains authoritative');
 await pageSound.close();
}finally{await browser.close()}
