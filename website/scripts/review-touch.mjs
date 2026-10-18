import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
for(const [width,height] of [[1440,1000],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(const [name,selector] of [['letter','.study-delay'],['echo','.anxious-instrument'],['loom','.rhythm-instrument'],['mobius','#mobius-section']]){
  await page.evaluate(s=>scrollTo({top:document.querySelector(s).getBoundingClientRect().top+scrollY-(s==='#mobius-section'?0:120),behavior:'instant'}),selector);await page.waitForTimeout(600);
  if(name==='echo')for(let i=0;i<5;i++)await page.locator('#call-need').click();
  if(name==='loom')for(let i=0;i<4;i++)await page.locator(`[data-promise="${i}"]`).click();
  if(name==='mobius'){await page.locator('[data-twist-step="2"]').click();await page.waitForTimeout(600)}
  await page.waitForTimeout(1100);
  await page.screenshot({path:`test-results/v4-${name}-${width}.png`});
 }
 console.log({width,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await page.close();
}
await browser.close();
