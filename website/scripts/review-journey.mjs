import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
fs.mkdirSync('test-results',{recursive:true});
const report=[];
try{
 for(const [name,width,height] of [['v2-desktop',1440,1000],['v2-mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1300);
  await page.screenshot({path:`test-results/${name}-hero.png`});
  const scenes=name.endsWith('desktop')?['abstract','chapter-04','chapter-05','chapter-06','distance-4','simulator','mobius-section','chapter-12']:['chapter-05','mobius-section','chapter-12'];
  for(const id of scenes){
   await page.evaluate(id=>{const e=document.getElementById(id);window.scrollTo({top:e.getBoundingClientRect().top+scrollY-(id==='mobius-section'?0:110),behavior:'instant'})},id);
   if(id==='mobius-section')await page.locator('[data-twist-step="2"]').click();
   await page.waitForTimeout(1500);await page.screenshot({path:`test-results/${name}-${id}.png`});
  }
  report.push({name,errors,...await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,width:innerWidth,artworks:document.querySelectorAll('[data-art]').length,blocks:document.querySelectorAll('#exhibition [data-original]').length,readingUnits:document.querySelectorAll('.reading-unit').length,three:document.querySelectorAll('.paper-stage.ready').length}))});
  await context.close();
 }
}finally{await browser.close()}
console.log(JSON.stringify(report,null,2));
