import assert from 'node:assert/strict';
import {launchBrowser} from './browser.mjs';
import {offlineUrlNoGate,devUrlNoGate} from './paths.mjs';
const url=process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate;
const browser=await launchBrowser();
const roles={
 titles:'#exhibition h2,#exhibition h3,#exhibition h4,#exhibition .dedication-end',
 body:'#exhibition .source-copy',
 quotations:'#exhibition .large-quote',
 explanation:'#exhibition .chapter-deck,#exhibition .interaction-caption,#exhibition .art-status,#exhibition .flow-study figcaption p,#exhibition .mobius-intro,#exhibition .touch-hint,#exhibition .practice-aside>p',
 notes:'#exhibition .eyebrow,#exhibition .tiny-label,#exhibition .study-kicker,#exhibition .stage-coordinate,#exhibition .source-location',
 equations:'#exhibition .model-equation,#exhibition .model-equations',
 reader:'#source-reader .source-copy',
};
try{
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.goto(url+'#chapter-04',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  for(const [role,selector] of Object.entries(roles)){
   const styles=await page.locator(selector).evaluateAll(nodes=>nodes.map(el=>{
    const s=getComputedStyle(el);return{font:s.fontFamily,weight:s.fontWeight,color:s.color,text:el.textContent.trim().slice(0,25)};
   }));
   assert(styles.length>0,role);
   for(const property of ['font','weight','color']){
    const distinct=new Set(styles.map(s=>s[property]));
    assert.equal(distinct.size,1,`${width}px ${role}: ${property} differs: ${[...distinct].join(' / ')}`);
   }
  }
  assert.deepEqual(await page.locator('#mirror-installation [data-voice]').allTextContents(),['不能失去自己','不能没有你']);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  console.log(`PASS ${width}: matching fonts, weights and colors within all seven text roles`);
  await page.close();
 }
}finally{await browser.close()}
