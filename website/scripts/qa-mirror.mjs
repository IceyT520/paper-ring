import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';
const url=(process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate)+'#chapter-06';
const browser=await launchBrowser(),report=[];
try{
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});
  const scene=page.locator('#mirror-installation'),blue=page.locator('#court-room-blue'),red=page.locator('#court-room-red');
  await scene.scrollIntoViewIfNeeded();
  const privateFloors=()=>page.locator('.court-private-floor').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')));
  const before=await privateFloors();
  await blue.focus();await page.keyboard.press('Enter');
  assert.equal(await blue.getAttribute('aria-pressed'),'true');assert.equal(await red.getAttribute('aria-pressed'),'false','one decision cannot move the other person');
  assert.equal(await scene.getAttribute('data-established'),'false');
  await red.focus();await page.keyboard.press('Space');
  assert.equal(await scene.getAttribute('data-established'),'true');
  assert.equal(await page.locator('#court-common').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.deepEqual(await privateFloors(),before,'neither private room is consumed by the common floor');
  await scene.screenshot({path:`test-results/courtyard-${width}-shared.png`});
  const redPosition=await page.locator('#court-person-red').getAttribute('transform');
  await blue.click();
  assert.equal(await scene.getAttribute('data-blue'),'home');assert.equal(await scene.getAttribute('data-red'),'courtyard');
  assert.equal(await page.locator('#court-person-red').getAttribute('transform'),redPosition,'the other person does not pursue');
  assert.equal(await page.locator('#court-reserved-blue').evaluate(el=>getComputedStyle(el).opacity),'1');
  await scene.screenshot({path:`test-results/courtyard-${width}-home.png`});
  await red.click();
  assert.equal(await scene.getAttribute('data-established'),'true','two private choices must not erase the common place');
  assert.equal(await page.locator('#court-common').evaluate(el=>getComputedStyle(el).opacity),'1');
  for(const seat of ['blue','red'])assert.equal(await page.locator(`#court-reserved-${seat}`).evaluate(el=>getComputedStyle(el).opacity),'1');
  await page.locator('#chapter-05').scrollIntoViewIfNeeded();await scene.scrollIntoViewIfNeeded();
  assert.equal(await scene.getAttribute('data-established'),'true');
  for(const el of await scene.locator('button,.court-common-label,.court-heading,.court-caption').all()){
   const b=await el.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1,`controls/labels overflow at ${width}: ${await el.getAttribute('class')}`);
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#court-reset').click();assert.equal(await scene.getAttribute('data-established'),'false');
  assert.equal(await blue.getAttribute('aria-pressed'),'false');assert.equal(await red.getAttribute('aria-pressed'),'false');
  // The paper room itself is clickable, in addition to its native keyboard button.
  await page.locator('.court-touch[data-side="blue"]').click();assert.equal(await blue.getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);report.push({width,independentChoices:true,persistentCourtyard:true,overflow:false});
  await page.close();console.log('PASS private rooms and persistent shared courtyard',width);
 }
 const touchPage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await touchPage.goto(url,{waitUntil:'networkidle'});await touchPage.locator('#court-room-blue').tap();
 await touchPage.locator('.court-stage').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
 const touch=await touchPage.context().newCDPSession(touchPage);
 const b=await touchPage.locator('#court-room-blue').boundingBox(),yBefore=await touchPage.evaluate(()=>scrollY);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+15}]});
 for(let n=1;n<=6;n++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+15-n*20}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await touchPage.evaluate(()=>scrollY)>yBefore+30,'vertical touch still scrolls the article');
 assert.equal(await touchPage.locator('#court-room-blue').getAttribute('aria-pressed'),'true','a scroll is not a room visit');
 await touchPage.close();
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'networkidle'});
 const scene=page.locator('#mirror-installation');await scene.scrollIntoViewIfNeeded();
 await page.locator('#court-room-blue').click();await page.waitForTimeout(500);await page.locator('#court-room-red').click();
 await page.waitForTimeout(600);await page.locator('#court-room-blue').click();
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.animating==='false');
 assert.equal(await scene.getAttribute('data-blue'),'home');assert.equal(await scene.getAttribute('data-red'),'courtyard');
 assert.equal(await scene.getAttribute('data-established'),'true');
 const idle=await scene.innerHTML();await page.waitForTimeout(250);assert.equal(await scene.innerHTML(),idle,'no scene rendering continues at rest');
 await page.locator('#court-reset').click();await page.waitForTimeout(200);
 await page.locator('#chapter-05').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.animating==='false');
 assert.equal(await scene.getAttribute('data-established'),'false');
 await scene.scrollIntoViewIfNeeded();await page.locator('#court-room-blue').click();
 await page.evaluate(()=>document.body.classList.add('reduced-motion'));
 await page.waitForFunction(()=>document.querySelector('#mirror-installation').dataset.animating==='false');
 assert.equal(await scene.getAttribute('data-blue'),'courtyard');
 assert.deepEqual(errors,[]);await page.close();
 report.push({touchScrolling:true,rapidChoices:true,offscreenStop:true,reducedMotion:true,idleWrites:0});
 fs.writeFileSync('test-results/courtyard-qa.json',JSON.stringify(report,null,2));console.log('PASS touch, rapid reversal, reduced motion, and zero idle writes');
}finally{await browser.close()}
