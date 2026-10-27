import assert from 'node:assert/strict';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';
const url=process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate;
const browser=await launchBrowser();
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 await page.goto(url+'#chapter-07',{waitUntil:'load'});
 const target=page.locator('#subtitle-anx');await target.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
 const before=await target.textContent();
 await page.locator('[data-subtitle="1"]').click();
 assert.equal(await target.textContent(),before,'old text remains until it has faded out');
 assert(await target.evaluate(el=>el.getAnimations().some(a=>a.playState==='running')),'a real opacity transition must run');
 await page.locator('[data-subtitle="2"]').click();
 await page.waitForFunction(()=>document.querySelector('#subtitle-anx').textContent==='我想进入你的世界');
 await page.waitForTimeout(600);
 assert.equal(await target.textContent(),'我想进入你的世界','rapid changes settle on the last choice');
 assert(+await target.evaluate(el=>getComputedStyle(el).opacity)>.99);
 await page.locator('#menu-toggle').click();await page.waitForTimeout(400);
 await page.locator('#menu-close').click();
 assert(await page.locator('#chapter-menu').evaluate(el=>el.open),'menu remains mounted during its fade-out');
 await page.waitForSelector('#chapter-menu:not([open])',{state:'attached'});
 await page.locator('#reader-toggle').click();
 await page.waitForSelector('#source-reader:not([hidden])');
 await page.waitForTimeout(500);
 assert.equal(await page.locator('#source-reader [data-original]').count(),71);
 await page.locator('#reader-toggle').click();await page.waitForSelector('#exhibition:not([hidden])');
 await page.waitForTimeout(400);
 await page.locator('#reader-toggle').click();await page.waitForSelector('#source-reader:not([hidden])');
 await page.waitForTimeout(60);
 const reversal=await page.evaluate(()=>{
  const el=document.querySelector('#source-reader'),before=+getComputedStyle(el).opacity;
  document.querySelector('#reader-toggle').click();
  return{before,after:+getComputedStyle(el).opacity};
 });
 assert(reversal.after<=reversal.before+.02,'reversing reading mode continues from the current opacity without a flash');
 await page.waitForSelector('#exhibition:not([hidden])');
 await page.locator('.hero').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
 // Record inside the browser's frames: a remote runner can finish the short
 // exit between a click response and a later screenshot/opacity request.
 const titleFade=await page.evaluate(async()=>{
  const line=document.querySelector('.hero-title h1>span'),samples=[];
  document.querySelector('#replay-opening').click();
  await new Promise(resolve=>{
   function sample(){
    samples.push(+getComputedStyle(line).opacity);
    if(document.documentElement.dataset.opening==='leaving')requestAnimationFrame(sample);else resolve();
   }
   requestAnimationFrame(sample);
  });
  return samples;
 });
 assert(titleFade.some(opacity=>opacity>0&&opacity<.99),`replay fades the existing title away before restarting: ${titleFade}`);
 await page.waitForSelector('html[data-opening=running]');
 const skipOpacity=await page.evaluate(()=>{
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  return +getComputedStyle(document.querySelector('.hero-title h1>span')).opacity;
 });
 assert(skipOpacity<.8,'skip fades the actual title lines back in');
 await page.waitForTimeout(450);
 assert(+await page.locator('.hero-title h1>span').first().evaluate(el=>getComputedStyle(el).opacity)>.99);
 console.log('PASS: text fades before replacement, latest click wins, menu fades, reader switch preserves all content');
 await page.close();
}finally{await browser.close()}
