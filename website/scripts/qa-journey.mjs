import {devUrlNoGate} from './paths.mjs';
import {settleOpening} from './browser.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const reports=[];
const check=async(name,fn)=>{await fn();reports.push(name);console.log('PASS',name)};
try{
 for(const [width,height] of [[1440,1000],[390,844],[360,800],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(devUrlNoGate,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await settleOpening(page);
  await check(`${width}px: continuous backgrounds, complete text, six new illustrations`,async()=>{
   const styles=await page.locator('#exhibition>.chapter,#exhibition .abstract-section,#exhibition .hero').evaluateAll(els=>els.map(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).backgroundImage]));
   assert(styles.every(([color,image])=>color==='rgba(0, 0, 0, 0)'&&image==='none'));
   assert.equal(await page.locator('#exhibition [data-original]').count(),71);
   assert.equal(await page.locator('[data-art]').count(),6);
   assert.equal(await page.locator('#chapter-12 h2').textContent(),'原文与参考');
   assert.equal(await page.locator('#chapter-09 #mobius-section').count(),1);
  });
  await check(`${width}px: four promises stitch the independent paths together`,async()=>{
   const before=await page.locator('#rhythm-blue').getAttribute('d');
   for(let i=0;i<4;i++)await page.locator(`[data-promise="${i}"]`).click();
   assert.equal(await page.locator('#rhythm-blue').getAttribute('d'),before);
   assert.notEqual(await page.locator('#rhythm-blue').getAttribute('d'),await page.locator('#rhythm-red').getAttribute('d'));
   assert.equal(await page.locator('.promise-stitch.sewn').count(),4);
  });
  await page.evaluate(()=>{const el=document.querySelector('#mobius-section');scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'})});
  await page.waitForTimeout(350);
  await check(`${width}px: Mobius steps, reverse scroll and replay`,async()=>{
   await page.locator('[data-twist-step="2"]').click();await page.waitForFunction(()=>document.querySelector('#mobius-stage').dataset.paperProgress==='1');
   assert.equal(await page.locator('[data-twist-step="2"]').getAttribute('aria-pressed'),'true');
   assert((await page.locator('#twist-caption').textContent()).includes('重新连接'));
   assert(await page.locator('#mobius-stage canvas').isVisible());
   await page.screenshot({path:`test-results/v2-mobius-${width}.png`});
   await page.locator('[data-twist-step="0"]').click();await page.waitForFunction(()=>document.querySelector('#mobius-stage').dataset.paperProgress==='0.08');
   assert((await page.locator('#twist-caption').textContent()).includes('打开接缝'));
   await page.locator('[data-twist-step="1"]').click();await page.waitForFunction(()=>document.querySelector('#mobius-stage').dataset.paperProgress==='0.52');
   assert((await page.locator('#twist-caption').textContent()).includes('扭转半圈'));
   await page.locator('#replay-twist').click();await page.waitForTimeout(500);
   const p=Number(await page.locator('#mobius-stage').getAttribute('data-paper-progress'));assert(p>0&&p<.2);
   await page.locator('#motion-toggle').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('reduced-motion')),true);
   assert((await page.locator('#twist-caption').textContent()).includes('打开接缝'));
  });
  await check(`${width}px: no runtime errors or horizontal overflow`,async()=>{
   assert.deepEqual(errors,[]);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  });
  await context.close();
 }
 fs.writeFileSync('test-results/journey-report.json',JSON.stringify({passed:reports.length,checks:reports},null,2));
}finally{await browser.close()}
