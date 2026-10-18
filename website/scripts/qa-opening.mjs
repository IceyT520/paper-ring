import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';

// Catches an opening that never settles, leaves the cover displaced/hidden,
// restarts without a request, fails to unlock reading, or ignores reduced motion.
const browser=await chromium.launch({channel:'msedge',headless:true});
const offline=process.argv.includes('--offline');
const url=offline?offlineUrlNoGate:devUrlNoGate,report=[];
fs.mkdirSync('test-results',{recursive:true});
async function settled(page){
 assert(await page.locator('#skip-opening').isHidden());
 const states=await page.locator('.hero-title h1>span,.hero-title>p,.hero-caption,.hero-bottom').evaluateAll(els=>els.map(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform})));
 for(const s of states){assert.equal(s.opacity,'1');assert.equal(s.transform,'none')}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
}
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];
  await page.addInitScript(()=>{
   window.heroFrames=0;
   const proto=WebGL2RenderingContext.prototype,clear=proto.clear;
   proto.clear=function(...args){if(this.canvas.parentElement?.id==='hero-stage')window.heroFrames++;return clear.apply(this,args)};
  });
  page.on('pageerror',e=>errors.push(e.message));
  const began=Date.now();
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#skip-opening',{state:'visible',timeout:1800});
  const controlRight=await page.locator('#skip-opening').evaluate(el=>el.getBoundingClientRect().right);
  assert(Number(await page.locator('.hero-title h1>span').first().evaluate(el=>getComputedStyle(el).opacity))<.25,'title must not arrive before the paper');
  await page.waitForTimeout(1000);await page.screenshot({path:`test-results/opening-${width}-early.png`});
  await page.waitForTimeout(2400);await page.screenshot({path:`test-results/opening-${width}-middle.png`});
  await page.waitForSelector('#skip-opening',{state:'hidden',timeout:6000});
  const duration=Date.now()-began;assert(duration<10000,`opening took ${duration}ms`);
  await settled(page);await page.screenshot({path:`test-results/opening-${width}-final.png`});
  assert(Math.abs(await page.locator('#replay-opening').evaluate(el=>el.getBoundingClientRect().right)-controlRight)<1,'switching controls must not shift the shared footer slot');
  const canvas=page.locator('#hero-stage canvas');assert(await canvas.isVisible());
  // Locator screenshots scroll clipped mobile artwork into view, changing the cover.
  // Capture only the visible canvas area without scrolling any ancestor.
  const b=await canvas.boundingBox(),clip={x:Math.max(0,b.x),y:Math.max(0,b.y),width:Math.min(width,b.x+b.width)-Math.max(0,b.x),height:Math.min(1000,b.y+b.height)-Math.max(0,b.y)};
  const first=await page.screenshot({clip}),frames=await page.evaluate(()=>window.heroFrames);await page.waitForTimeout(450);
  assert(first.equals(await page.screenshot({clip})),'paper must hold still after the opening');
  assert.equal(await page.evaluate(()=>window.heroFrames),frames,'settled cover must stop WebGL drawing');
  await page.evaluate(()=>scrollTo({top:innerHeight,behavior:'instant'}));await page.waitForTimeout(150);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settled(page);
  assert.deepEqual(errors,[]);report.push({width,duration});console.log('PASS opening settles and remains still',width,duration+'ms');await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('#skip-opening').click();await settled(page);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#skip-opening',{state:'visible'});
 await page.evaluate(()=>scrollTo({top:350,behavior:'instant'}));await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>scrollY),0);assert(await page.locator('#skip-opening').isVisible());
 await page.keyboard.press('Escape');await settled(page);
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForSelector('#skip-opening',{state:'visible'});
 await page.locator('#motion-toggle').click();await settled(page);
 const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(url,{waitUntil:'networkidle'});await settled(reduced);
 const deep=await browser.newPage();await deep.goto(url+'#chapter-06',{waitUntil:'networkidle'});await settled(deep);assert(await deep.evaluate(()=>scrollY>1000));
 const fallback=await browser.newPage();await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=new Proxy(HTMLCanvasElement.prototype.getContext,{apply(target,thisArg,args){return String(args[0]).includes('webgl')?null:Reflect.apply(target,thisArg,args)}})});
 await fallback.goto(url,{waitUntil:'domcontentloaded'});await fallback.locator('#skip-opening').click();await fallback.waitForTimeout(1500);await settled(fallback);assert(await fallback.locator('#hero-stage .ring-fallback').isVisible());
 console.log('PASS skip, scroll lock, motion toggle, reduced motion, chapter entry and WebGL fallback');
 fs.writeFileSync(`test-results/opening${offline?'-offline':''}-report.json`,JSON.stringify(report,null,2));
}finally{await browser.close()}
