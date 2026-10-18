import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {offlineUrl} from './paths.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const url=process.argv.includes('--offline')?offlineUrl:'http://127.0.0.1:4173/';
const report=[];
try{
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});await page.locator('.study-origin').scrollIntoViewIfNeeded();
  const button=page.locator('#origin-reveal');assert.equal(await button.count(),1,'the shared need must be directly touchable');
  const span=async side=>page.locator(`.origin-${side} .origin-fold`).evaluateAll(els=>{const boxes=els.map(e=>e.getBoundingClientRect());return Math.max(...boxes.map(b=>b.right))-Math.min(...boxes.map(b=>b.left))});
  const closed=await span('blue'),expanded=await span('red');assert(closed<expanded*.7,'blue contracts while red reaches out');
  await page.screenshot({path:`test-results/origin-${width}-protected.png`});
  await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
  assert(Math.abs(await span('blue')-await span('red'))<3,'setting protection down reveals matching paper structures');
  for(const note of await page.locator('.origin-need').all())assert.equal(await note.evaluate(el=>getComputedStyle(el).opacity),'1','the need underneath must become visible');
  await page.screenshot({path:`test-results/origin-${width}-unfolded.png`});
  await page.locator('#chapter-05').scrollIntoViewIfNeeded();await button.scrollIntoViewIfNeeded();assert.equal(await button.getAttribute('aria-pressed'),'true','returning must retain the chosen view');
  await button.focus();await page.keyboard.press('Space');assert.equal(await button.getAttribute('aria-pressed'),'false');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const outside=await page.locator('.origin-copy,#origin-reveal').evaluateAll(els=>els.some(el=>{const b=el.getBoundingClientRect();return b.left<0||b.right>innerWidth}));assert(!outside);
  assert.deepEqual(errors,[]);report.push({width,closed,expanded});console.log('PASS paper protection interaction',width);await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(url+'#chapter-03',{waitUntil:'networkidle'});
 await page.locator('.study-origin').scrollIntoViewIfNeeded();await page.waitForTimeout(1900);await page.locator('#origin-reveal').click();await page.waitForTimeout(1800);
 assert.equal(await page.locator('.origin-need').first().evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await page.locator('.study-origin').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'the completed sculpture must not keep animating');
 console.log('PASS finite animation and settled reveal');fs.writeFileSync('test-results/origin-report.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
