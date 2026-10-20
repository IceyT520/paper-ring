import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';

const url=(process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate)+'#chapter-06';
const browser=await launchBrowser();
const report=[];
try{
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});
  const scene=page.locator('#mirror-installation'),knot=page.locator('#mirror-knot');
  assert.equal(await knot.count(),1,'the paper knot must be directly touchable');
  await scene.scrollIntoViewIfNeeded();
  const rest=await scene.locator('.tension-ribbon').first().getAttribute('d');
  await knot.focus();await page.keyboard.press('Enter');
  assert.equal(await knot.getAttribute('aria-pressed'),'true','keyboard reveals the shared need');
  assert.notEqual(await scene.locator('.tension-ribbon').first().getAttribute('d'),rest,'the paper really opens');
  assert.equal(await scene.locator('.mirror-shared').evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.screenshot({path:`test-results/mirror-${width}-open.png`});
  await scene.locator('[data-mirror-side="-1"]').click();
  assert.equal(await knot.getAttribute('aria-pressed'),'false','a voice returns to its protective posture');
  assert.equal(await scene.getAttribute('data-side'),'left');
  const leftFold=await scene.locator('.tension-ribbon').first().getAttribute('d');
  await scene.locator('[data-mirror-side="1"]').click();
  assert.equal(await scene.getAttribute('data-side'),'right');
  assert.notEqual(await scene.locator('.tension-ribbon').first().getAttribute('d'),leftFold,'both voices must physically pull the sheet');
  await scene.locator('#mirror-reset').click();
  assert.equal(await scene.getAttribute('data-state'),'taut');
  const rect=await knot.boundingBox();
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  await page.mouse.down();
  await page.mouse.move(rect.x+rect.width/2-65,rect.y+rect.height/2+5,{steps:8});
  assert.equal(await scene.getAttribute('data-state'),'pulling');
  await page.mouse.up();
  assert.equal(await knot.getAttribute('aria-pressed'),'true','letting go reveals rather than toggling twice');
  await page.locator('#chapter-05').scrollIntoViewIfNeeded();await scene.scrollIntoViewIfNeeded();
  assert.equal(await knot.getAttribute('aria-pressed'),'true','scrolling back keeps the reader’s choice');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const el of await scene.locator('.mirror-voice,#mirror-knot,.mirror-foot').all()){
   const b=await el.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1,'controls and text stay inside the screen');
  }
  assert.deepEqual(errors,[]);report.push({width,keyboard:true,drag:true,overflow:false});
  await scene.locator('#mirror-reset').click();
  await page.screenshot({path:`test-results/mirror-${width}-taut.png`});
  await page.close();console.log('PASS mirror input and layout',width);
 }
 const touchPage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await touchPage.goto(url,{waitUntil:'networkidle'});
 await touchPage.locator('#mirror-knot').tap();
 await touchPage.locator('#mirror-installation').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
 const touch=await touchPage.context().newCDPSession(touchPage);
 let b=await touchPage.locator('#mirror-knot').boundingBox();
 const yBefore=await touchPage.evaluate(()=>scrollY);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
 for(let n=1;n<=6;n++){
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2-n*16}]});
  await touchPage.waitForTimeout(20);
 }
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await touchPage.evaluate(()=>scrollY)>yBefore+30,'vertical swipes on the knot must scroll the article');
 assert.equal(await touchPage.locator('#mirror-knot').getAttribute('aria-pressed'),'true','vertical scrolling must preserve the chosen view');
 await touchPage.locator('#mirror-reset').tap();
 await touchPage.locator('#mirror-installation').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
 b=await touchPage.locator('#mirror-knot').boundingBox();
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
 for(let n=1;n<=6;n++){
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2+n*10,y:b.y+b.height/2}]});
 }
 assert.equal(await touchPage.locator('#mirror-installation').getAttribute('data-state'),'pulling');
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await touchPage.locator('#mirror-knot').getAttribute('aria-pressed'),'true','a real touch drag opens on release');
 await touchPage.close();console.log('PASS real touch gestures: horizontal pull, vertical native scroll');
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'networkidle'});
 const scene=page.locator('#mirror-installation');
 await scene.scrollIntoViewIfNeeded();await page.waitForTimeout(2100);
 await page.locator('#mirror-knot').click();await page.waitForTimeout(2800);
 assert.equal(await scene.getAttribute('data-state'),'open');
 const settled=await scene.locator('.tension-ribbon').first().getAttribute('d');
 await page.waitForTimeout(180);
 assert.equal(await scene.locator('.tension-ribbon').first().getAttribute('d'),settled,'idle geometry stops updating');
 assert.equal(await scene.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'no permanent animation loop');
 await page.locator('#mirror-reset').click();
 await page.locator('#chapter-05').scrollIntoViewIfNeeded();await page.waitForTimeout(100);
 assert.equal(await scene.getAttribute('data-animating'),'false','offscreen geometry must stop immediately');
 await scene.scrollIntoViewIfNeeded();
 await page.locator('#mirror-knot').click();await page.locator('#mirror-knot').click();await page.locator('#mirror-knot').click();
 await page.waitForTimeout(2500);
 assert.equal(await page.locator('#mirror-knot').getAttribute('aria-pressed'),'true','rapid toggles settle at the last choice');
 await page.locator('#mirror-reset').click();await page.waitForTimeout(180);
 await page.locator('#motion-toggle').click();await page.waitForTimeout(50);
 assert.equal(await scene.getAttribute('data-animating'),'false','reducing motion settles an active transition');
 assert.deepEqual(errors,[]);
 fs.writeFileSync('test-results/mirror-report.json',JSON.stringify(report,null,2));
 console.log('PASS finite animation and live reduced-motion preference');
}finally{await browser.close()}
