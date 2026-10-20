import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';

const url=(process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate)+'#chapter-06';
const browser=await launchBrowser(),report=[];
try{
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});
  const scene=page.locator('#mirror-installation'),space=page.locator('#connection-space'),call=page.locator('#connection-call');
  assert.equal(await space.count(),1,'each person must have a directly touchable light');
  await scene.scrollIntoViewIfNeeded();
  const room=selector=>page.locator(selector).boundingBox();
  const blueBefore=await room('#connection-space'),redBefore=await room('#connection-call');
  await space.focus();await page.keyboard.press('Enter');
  assert.equal(await space.getAttribute('aria-pressed'),'true');
  const blueAfter=await room('#connection-space'),redAfter=await room('#connection-call');
  assert(Math.hypot(blueAfter.x-blueBefore.x,blueAfter.y-blueBefore.y)>15);
  assert(Math.abs(redAfter.x-redBefore.x)<1&&Math.abs(redAfter.y-redBefore.y)<1,'red stays in their own space');
  assert.equal(await scene.getAttribute('data-space'),'apart');
  const bridge=await page.locator('#connection-path').getAttribute('d');
  assert.equal(await page.locator('#connection-path').evaluate(el=>getComputedStyle(el).opacity),'1','the connection stays visible during separation');
  await call.focus();await page.keyboard.press('Space');
  assert.match(await page.locator('#connection-blue-message').textContent(),/我在/);
  assert.equal(await space.getAttribute('aria-pressed'),'true','a request must not force the other person out of their space');
  assert.equal(await page.locator('#connection-path').getAttribute('d'),bridge);
  await page.screenshot({path:`test-results/connection-${width}-apart.png`});
  await page.locator('#chapter-05').scrollIntoViewIfNeeded();await scene.scrollIntoViewIfNeeded();
  assert.equal(await scene.getAttribute('data-space'),'apart');
  await space.click();assert.equal(await space.getAttribute('aria-pressed'),'false');
  await page.screenshot({path:`test-results/connection-${width}-together.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const el of await scene.locator('button,.connection-head,.connection-caption').all()){
   const b=await el.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1,'controls stay inside the screen');
  }
  assert.deepEqual(errors,[]);report.push({width,space:true,reply:true,overflow:false});
  await page.close();console.log('PASS personal space and reliable reply',width);
 }
 const touchPage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await touchPage.goto(url,{waitUntil:'networkidle'});await touchPage.locator('#connection-space').tap();
 await touchPage.locator('.connection-stage').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
 const touch=await touchPage.context().newCDPSession(touchPage);
 const b=await touchPage.locator('#connection-space').boundingBox(),yBefore=await touchPage.evaluate(()=>scrollY);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
 for(let n=1;n<=6;n++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2-n*16}]});await touchPage.waitForTimeout(20)}
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await touchPage.evaluate(()=>scrollY)>yBefore+30);
 assert.equal(await touchPage.locator('#connection-space').getAttribute('aria-pressed'),'true');
 // A tap during native momentum scrolling intentionally only stops the
 // momentum. Wait for the scroll to settle before testing an activating tap.
 await touchPage.evaluate(()=>new Promise(resolve=>{
  let timer;
  const done=()=>{removeEventListener('scroll',onScroll);resolve()};
  const onScroll=()=>{clearTimeout(timer);timer=setTimeout(done,180)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
 }));
 await touchPage.locator('#connection-call').tap();
 assert.match(await touchPage.locator('#connection-blue-message').textContent(),/我在/);
 await touchPage.close();console.log('PASS touch calls and uninterrupted vertical reading');

 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(url,{waitUntil:'networkidle'});
 const scene=page.locator('#mirror-installation');await scene.scrollIntoViewIfNeeded();await page.waitForTimeout(2600);
 await page.locator('#connection-space').click();await page.waitForTimeout(900);
 assert.equal(await page.locator('#connection-path').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.locator('#connection-call').click();
 await page.waitForFunction(()=>{
  const el=document.querySelector('#mirror-installation');
  return el.dataset.animating==='false'&&!el.getAnimations({subtree:true}).some(a=>a.playState==='running');
 });
 assert.equal(await scene.getAttribute('data-space'),'apart');
 assert.match(await page.locator('#connection-blue-message').textContent(),/我在/);
 assert.equal(await scene.getAttribute('data-animating'),'false');
 const settled=await scene.innerHTML;await page.waitForTimeout(200);
 assert.equal(await scene.innerHTML,settled,'settled artwork stops mutating');
 assert.equal(await scene.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
 await page.locator('#connection-space').click();await page.locator('#connection-space').click();
 await page.locator('#motion-toggle').click();await page.waitForTimeout(50);
 assert.equal(await scene.getAttribute('data-animating'),'false');
 await page.locator('#connection-replay').click();
 assert.equal(await scene.getAttribute('data-space'),'together');
 await page.locator('#motion-toggle').click();await page.locator('#connection-call').click();
 await page.locator('#chapter-05').scrollIntoViewIfNeeded();await page.waitForTimeout(100);
 assert.equal(await scene.getAttribute('data-animating'),'false');
 fs.writeFileSync('test-results/mirror-report.json',JSON.stringify(report,null,2));
 console.log('PASS interrupted response, rapid input, reduced motion and offscreen settling');
}finally{await browser.close()}
