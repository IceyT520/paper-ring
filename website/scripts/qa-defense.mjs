import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Regression: scrolling used to overwrite the click's movement; the view only faded.
// Verify the visible sculpture actually turns, even after reading down the chapter.
const browser=await chromium.launch({channel:'msedge',headless:true}),report=[];
try{
 for(const [width,height] of [[1440,1000],[768,1024],[390,844],[360,800]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<760});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.locator('#p012').scrollIntoViewIfNeeded();
  await page.locator('#wall-perspective').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);
  const orientation=()=>page.evaluate(()=>getComputedStyle(document.querySelector('.defense-object')||document.querySelector('.wall-art')).transform);
  const outsideLight=await page.locator('.defense-inner-aura').evaluate(el=>Number(getComputedStyle(el).opacity));
  const outside=await orientation();await page.locator('#wall-perspective').click();await page.waitForTimeout(1600);
  const inside=await orientation();assert.notEqual(inside,outside,'Looking behind the wall must change the physical viewpoint, not just its text/opacity');
  assert.equal(await page.locator('#wall-perspective').getAttribute('aria-pressed'),'true');
  assert(await page.locator('.defense-inner-aura').evaluate(el=>Number(getComputedStyle(el).opacity))>outsideLight,'The inner view must illuminate the protected need');
  await page.screenshot({path:`test-results/v7-defense-inside-${width}.png`});
  await page.locator('#chapter-06').scrollIntoViewIfNeeded();await page.locator('#wall-perspective').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);
  assert.equal(await orientation(),inside,'Reading and returning must not overwrite the chosen viewpoint');
  await page.locator('#wall-perspective').click();await page.waitForTimeout(1600);
  const gap=()=>page.evaluate(()=>{const a=document.querySelector('.defense-wing-left .fold-third').getBoundingClientRect(),b=document.querySelector('.defense-wing-right .fold-third').getBoundingClientRect();return b.left-a.right});
  const farGap=await gap(),openBeam=await page.locator('.defense-beam').boundingBox();await page.screenshot({path:`test-results/v7-defense-outside-${width}.png`});
  if(width>=760){const box=await page.locator('.defense-viewport').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2)}
  else await page.locator('.defense-touch-target').tap();
  await page.waitForTimeout(650);const nearGap=await gap();
  assert(nearGap<farGap-25,`Approaching must narrow the actual paper opening: ${farGap} -> ${nearGap}`);
  assert((await page.locator('.defense-beam').boundingBox()).width<openBeam.width*.2,'Closing the paper must also narrow the light escaping through it');
  await page.screenshot({path:`test-results/v7-defense-close-${width}.png`});
  await page.mouse.move(0,0);if(width<760)await page.locator('#wall-approach').click();await page.waitForTimeout(650);
  assert(Math.abs(await gap()-farGap)<2,'Retreating must restore the opening');
  await page.locator('#wall-approach').focus();await page.keyboard.press('Enter');await page.waitForTimeout(650);
  assert(await gap()<farGap-25,'Keyboard and touch controls must also close the folds');
  await page.locator('#motion-toggle').click();await page.locator('#wall-perspective').click();
  assert.notEqual(await orientation(),outside,'Reduced motion still reveals the reverse side');
  await page.locator('#wall-perspective').click();assert.equal(await page.locator('#wall-perspective').getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  report.push({width,farGap,nearGap,inside,outside});console.log('PASS defense',width,{farGap,nearGap});await context.close();
 }
 fs.writeFileSync('test-results/defense-report.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
