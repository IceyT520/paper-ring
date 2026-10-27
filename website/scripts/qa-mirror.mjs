import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';
const url=(process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate)+'#chapter-06';
const browser=await launchBrowser(),report=[];
try{
 const batched=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
 await batched.addInitScript(()=>{
  const Observer=window.IntersectionObserver;
  window.IntersectionObserver=class extends Observer{
   constructor(callback,options){super((entries,observer)=>{
    const batch=entries.flatMap(entry=>{
     if(entry.target.id!=='connection-meet')return[entry];
     if(entry.isIntersecting&&entry.intersectionRatio>=.1)window.__shelterVisibleDelivered=true;
     return[{target:entry.target,time:entry.time-.01,isIntersecting:!entry.isIntersecting,intersectionRatio:entry.isIntersecting?0:1},entry];
    });
    callback(batch,observer);
   },options)}
  };
 });
 await batched.goto(url,{waitUntil:'networkidle'});
 await batched.locator('#connection-meet').scrollIntoViewIfNeeded();
 await batched.waitForFunction(()=>window.__shelterVisibleDelivered===true);
 assert.equal(await batched.locator('#mirror-installation').getAttribute('data-weather'),'running','the newest visibility entry must win when transitions arrive in one batch');
 await batched.close();console.log('PASS batched visibility uses the latest state');
 // Reduced motion must apply the result synchronously. A global 0.01ms CSS
 // duration still creates a transition that waits for the next painted frame.
 const immediate=await browser.newPage({viewport:{width:768,height:1000},reducedMotion:'reduce'});
 await immediate.goto(url,{waitUntil:'networkidle'});
 await immediate.locator('#mirror-installation').scrollIntoViewIfNeeded();
 const settledOpacity=await immediate.evaluate(()=>{
  document.querySelector('#connection-meet').click();
  return getComputedStyle(document.querySelector('#shelter-shared-label')).opacity;
 });
 assert.equal(settledOpacity,'1','reduced motion must show the shared word immediately, without a hidden CSS transition');
 await immediate.close();
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'networkidle'});
  const scene=page.locator('#mirror-installation');await scene.scrollIntoViewIfNeeded();
  // These two exact statements are an explicit, permanent user requirement.
  assert.equal(await scene.locator('[data-voice]').count(),2,'both original statements must be present');
  const voices=scene.locator('[data-voice]');
  assert.deepEqual(await voices.allTextContents(),['不能失去自己','不能没有你']);
  assert.equal(await scene.locator('button').count(),1,'one directly understandable action');
  const button=page.locator('#connection-meet');
  const privateSpaces=()=>page.locator('[data-private]').evaluateAll(nodes=>nodes.map(n=>n.innerHTML));
  const before=await privateSpaces();
  await scene.screenshot({path:`test-results/shelter-${width}-before.png`});
  await button.focus();await page.keyboard.press('Enter');
  assert.equal(await scene.getAttribute('data-connected'),'true');
  assert.equal(await page.locator('#shelter-shared-label').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.deepEqual(await privateSpaces(),before,'personal spaces never shrink to make room for a relationship');
  assert.equal(await page.locator('#shelter-common').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert((await page.locator('#shelter-rain-boundary').getAttribute('d')).includes('L550 95'));
  for(const el of await voices.all()){
   assert(await el.isVisible());assert(await el.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=22);
   const b=await el.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1);
  }
  assert.deepEqual(await voices.allTextContents(),['不能失去自己','不能没有你']);
  await scene.screenshot({path:`test-results/shelter-${width}-after.png`});
  await page.keyboard.press('Space');assert.equal(await scene.getAttribute('data-connected'),'true');
  await page.locator('#chapter-05').scrollIntoViewIfNeeded();await scene.scrollIntoViewIfNeeded();
  assert.equal(await scene.getAttribute('data-connected'),'true');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);report.push({width,voicesPreserved:true,oneAction:true,threeSpaces:true});
  await page.close();console.log('PASS both statements and one-action shared space',width);
 }
 const touchPage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await touchPage.goto(url,{waitUntil:'networkidle'});
 await touchPage.locator('#connection-meet').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-150,behavior:'instant'}));
 const touch=await touchPage.context().newCDPSession(touchPage),box=await touchPage.locator('#connection-meet').boundingBox();
 const before=await touchPage.evaluate(()=>scrollY),x=box.x+box.width/2,y=box.y+100;
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let n=1;n<=6;n++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-n*18}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await touchPage.evaluate(()=>scrollY)>before+30);
 assert.equal(await touchPage.locator('#mirror-installation').getAttribute('data-connected'),'false','scrolling is not an activation');
 await touchPage.close();
 const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__shelterVisibility=[];
  const Observer=window.IntersectionObserver;
  window.IntersectionObserver=class extends Observer{
   constructor(callback,options){super((entries,observer)=>{
    const relevant=entries.filter(e=>e.target.id==='connection-meet');
    if(relevant.length)window.__shelterVisibility.push(relevant.map(e=>({time:e.time,ratio:e.intersectionRatio,intersects:e.isIntersecting,root:e.rootBounds?.toJSON(),bounds:e.boundingClientRect.toJSON()})));
    callback(entries,observer);
   },options)}
  };
 });
 await page.goto(url,{waitUntil:'networkidle'});
 const scene=page.locator('#mirror-installation'),button=page.locator('#connection-meet');await scene.scrollIntoViewIfNeeded();
 try{
  await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.weather==='running',undefined,{timeout:8000});
 }catch(error){
  console.error('Weather setup state',JSON.stringify(await page.evaluate(()=>({hidden:document.hidden,classes:document.body.className,media:matchMedia('(prefers-reduced-motion:reduce)').matches,weather:document.querySelector('#mirror-installation').dataset.weather,scroll:scrollY,viewport:[innerWidth,innerHeight],button:document.querySelector('#connection-meet').getBoundingClientRect().toJSON(),scene:document.querySelector('#mirror-installation').getBoundingClientRect().toJSON(),observations:window.__shelterVisibility}))));
  throw error;
 }
 await button.click();await page.waitForTimeout(650);
 for(const el of await scene.locator('[data-voice]').all())assert(await el.isVisible(),'the two statements must stay during the transition');
 await button.click();await button.click();
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.animating==='false');
 assert.equal(await scene.getAttribute('data-connected'),'true');
 // Playwright may scroll a focused button, and visibility pauses weather by design.
 // Measure moving rain only after the installation is visible and running again.
 await scene.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.weather==='running');
 const roof=await page.locator('#shelter-blue').innerHTML();
 const rain=await page.locator('#shelter-rain').getAttribute('d');
 await page.waitForFunction(previous=>document.querySelector('#shelter-rain').getAttribute('d')!==previous,rain,{timeout:2000});
 assert.notEqual(await page.locator('#shelter-rain').getAttribute('d'),rain,'rain must keep falling after the roof is connected');
 assert.equal(await page.locator('#shelter-blue').innerHTML(),roof,'continued weather must not keep rebuilding the settled roof');
 await button.click();await page.waitForTimeout(250);
 await page.locator('#chapter-05').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.animating==='false');
 assert.equal(await scene.getAttribute('data-connected'),'true');
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.weather==='paused');
 // Copy has finite fades now. Weather suspension concerns the two continuous
 // lamp effects and the SVG artwork, not a caption finishing its short fade.
 const lamps=await scene.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a instanceof CSSAnimation&&a.animationName==='shelter-lamplight').map(a=>a.playState));
 assert.deepEqual(lamps,['paused','paused'],'both continuous lamp animations pause offscreen');
 const artwork=scene.locator('.shelter-art');
 const offscreen=await artwork.innerHTML();await page.waitForTimeout(250);assert.equal(await artwork.innerHTML(),offscreen,'offscreen weather stops all artwork writes');
 await scene.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.weather==='running');
 const resumed=await page.locator('#shelter-rain').getAttribute('d');await page.waitForTimeout(200);
 assert.notEqual(await page.locator('#shelter-rain').getAttribute('d'),resumed,'rain resumes on return');
 await button.click();await page.evaluate(()=>document.body.classList.add('reduced-motion'));
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.animating==='false');
 assert.equal(await scene.getAttribute('data-connected'),'true');
 const quiet=await artwork.innerHTML();await page.waitForTimeout(250);assert.equal(await artwork.innerHTML(),quiet,'reduced-motion artwork is completely static');
 await page.evaluate(()=>document.body.classList.remove('reduced-motion'));
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.weather==='running');
 await page.evaluate(()=>document.body.classList.add('reader-mode'));
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.weather==='paused');
 const reading=await artwork.innerHTML();await page.waitForTimeout(250);assert.equal(await artwork.innerHTML(),reading,'reading mode pauses the hidden weather');
 await page.evaluate(()=>document.body.classList.remove('reader-mode'));
 await scene.scrollIntoViewIfNeeded();
 await page.setViewportSize({width:390,height:844});assert.equal(await scene.getAttribute('data-connected'),'true');
 assert.deepEqual(errors,[]);await page.close();
 report.push({nativeTouchScrolling:true,rapidClicks:true,offscreenStop:true,continuousRain:true,offscreenWrites:0,reducedMotion:true});
 fs.writeFileSync('test-results/shelter-qa.json',JSON.stringify(report,null,2));
 console.log('PASS touch, replay, rapid clicks, responsive state, reduced motion, continuous rain, and zero offscreen writes');
}finally{await browser.close()}
