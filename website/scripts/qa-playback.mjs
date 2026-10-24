import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';

// Regressions: scrolling exits an unfinished opening; replay cannot restart;
// scrolling or tapping the paper changes a selected morph stage; stage buttons scroll the page.
const browser=await chromium.launch({channel:'msedge',headless:true});
const offline=process.argv.includes('--offline');
const url=offline?offlineUrlNoGate:devUrlNoGate;
const failures=[];
async function check(name,fn){try{await fn();console.log('PASS',name)}catch(e){failures.push(name);console.error('FAIL',name,e.message)}}
try{
 if(!process.argv.includes('--mobius-only'))for(const width of [1440,390])await check(`${width}: opening locks reading, unlocks and replays`,async()=>{
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<760}),page=await context.newPage();
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForSelector('html[data-opening=running]');
   await page.mouse.wheel(0,650);await page.keyboard.press('PageDown');
   if(width<760){
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:650}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:220}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   }
   await page.waitForTimeout(250);
   assert.equal(await page.evaluate(()=>scrollY),0,'opening must block wheel, keyboard and touch scrolling');
   assert(await page.locator('html').getAttribute('data-opening'),'scrolling must not finish the opening');
   await page.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await page.waitForTimeout(100);
   assert.equal(await page.evaluate(()=>scrollY),0,'focus or programmatic scrolling must not leave the cover');
   await page.waitForSelector('html:not([data-opening])',{timeout:10000});
   await page.locator('#replay-opening').click();
   await page.waitForSelector('html[data-opening=running]');
   assert(Number(await page.locator('.hero-title h1>span').first().evaluate(el=>getComputedStyle(el).opacity))<.25,'replay must restart the title reveal');
   await page.mouse.wheel(0,500);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>scrollY),0);
   await page.keyboard.press('Escape');
   await page.waitForSelector('html:not([data-opening])');
   await page.mouse.wheel(0,500);await page.waitForTimeout(250);assert(await page.evaluate(()=>scrollY>100),'skip must restore scrolling');
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.locator('#replay-opening').click();await page.waitForSelector('html[data-opening=running]');
   await page.locator('#skip-opening').click();
   assert.equal(await page.locator('#menu-toggle').evaluate(el=>el.inert),false);
   await page.locator('#menu-toggle').click();assert(await page.locator('#chapter-menu').isVisible());
  }finally{await context.close()}
 });
 if(!process.argv.includes('--opening-only'))await check('Möbius progress changes only through buttons, without page jumps',async()=>{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  try{
   await page.goto(url+'#mobius-section',{waitUntil:'networkidle'});
   const stage=page.locator('#mobius-stage');await page.waitForSelector('#mobius-stage.ready');
   const progress=async()=>Number(await stage.getAttribute('data-paper-progress'));
   const initial=await progress();
   await page.mouse.wheel(0,420);await page.waitForTimeout(400);
   assert.equal(await progress(),initial,'wheel must not advance the morph');
   await page.locator('#mobius-section').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-40,behavior:'instant'}));
   await page.waitForTimeout(100);
   await page.locator('#mobius-settings summary').click();
   await page.locator('[data-twist-step="1"]').scrollIntoViewIfNeeded();
   const y=await page.evaluate(()=>scrollY);
   await page.locator('[data-twist-step="1"]').click();await page.waitForTimeout(1900);
   assert.equal(await progress(),.52);
   assert.equal(await page.evaluate(()=>scrollY),y,'stage buttons must not scroll the page');
   await stage.dispatchEvent('paper-touch',{detail:{phase:.2,offset:.28}});await page.waitForTimeout(200);
   assert.equal(await progress(),.52,'touching the paper must not complete an unfinished morph');
   await page.locator('#replay-twist').click();await page.waitForTimeout(700);
   await page.locator('#pause-twist').click();const paused=await progress();
   await page.waitForTimeout(250);assert.equal(await progress(),paused,'pause must stop progress');
   await page.mouse.wheel(0,450);await page.waitForTimeout(300);assert.equal(await progress(),paused);
   await page.locator('#pause-twist').click();await page.waitForTimeout(300);assert(await progress()>paused);
   await page.locator('[data-twist-step="2"]').click();await page.waitForTimeout(1900);assert.equal(await progress(),1);
   await page.locator('#motion-toggle').click();await page.locator('#motion-toggle').click();
   assert.equal(await progress(),1,'rebuilding motion must preserve the selected stage');
  }finally{await page.close()}
 });
 assert.deepEqual(failures,[]);
}finally{await browser.close()}
