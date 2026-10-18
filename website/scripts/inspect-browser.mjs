import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:name==='mobile',isMobile:name==='mobile'});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1800);
 await page.screenshot({path:`test-results/${name}-hero.png`});
 const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,three:!!document.querySelector('.paper-stage.ready canvas'),fonts:document.fonts.status,height:document.documentElement.scrollHeight,blocks:document.querySelectorAll('#exhibition [data-original]').length}));
 results.push({name,...layout,errors});
 if(name==='desktop'){
  for(const [scene,id] of [['ring','chapter-03'],['mirror','chapter-06'],['sandbox','simulator'],['practice','chapter-09']]){
   await page.evaluate(id=>{const el=document.getElementById(id);window.scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:'instant'})},id);
   await page.waitForTimeout(1300);await page.screenshot({path:`test-results/${scene}.png`});
  }
 }
 await context.close();
}
await browser.close();console.log(JSON.stringify(results,null,2));
