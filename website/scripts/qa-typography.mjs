import assert from 'node:assert/strict';
import {launchBrowser} from './browser.mjs';
import {offlineUrlNoGate,devUrlNoGate} from './paths.mjs';
const url=process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate;
const browser=await launchBrowser();
const roles={
 titles:'#exhibition h1,#exhibition h2,#exhibition h3,#exhibition h4,#exhibition .dedication-end',
 body:'#exhibition .source-copy:not(.dedication-copy .source-copy)',
 dedication:'#exhibition .dedication-copy .source-copy',
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
    const s=getComputedStyle(el),probe=document.createElement('span');
    probe.style.color='var(--type-title)';el.append(probe);const titleColor=getComputedStyle(probe).color;probe.remove();
    return{font:s.fontFamily,weight:s.fontWeight,color:s.color,titleColor,text:el.textContent.trim().slice(0,25)};
   }));
   assert(styles.length>0,role);
   for(const property of ['font','weight','color']){
    if(property==='color'&&['titles','quotations'].includes(role)){
     assert(styles.every(s=>s.color===s.titleColor),`${width}px ${role}: titles and quotations share their paper-white base`);
     continue;
    }
    const distinct=new Set(styles.map(s=>s[property]));
    assert.equal(distinct.size,1,`${width}px ${role}: ${property} differs: ${[...distinct].join(' / ')}`);
   }
  }
  const dedicationFont=await page.locator('.dedication-copy .source-copy').first().evaluate(el=>getComputedStyle(el).fontFamily);
  const serif=await page.locator('#chapter-11 h2').evaluate(el=>getComputedStyle(el).fontFamily);
  assert.equal(dedicationFont,serif,'the dedication keeps its original serif voice');
  for(const [selector,token] of [
   ['#chapter-01 h1','--paper'],['#chapter-04 h2','--paper'],['#chapter-05 h2','--paper'],['#chapter-10 h2','--paper'],['.dedication-end','--paper'],
   ['#chapter-04 h2 em','--avd'],['#chapter-05 h2 em','--anx'],['#chapter-09>.chapter-heading h2 em','--gold'],['#chapter-11 h2 em','--gold'],
   ['#chapter-03 h2 em','--paper'],['#chapter-07>.chapter-heading h2 em','--paper'],['#chapter-08>.chapter-heading h2 em','--paper'],['#finale-title','--paper']
  ]){
   const matches=await page.locator(selector).evaluate((el,token)=>{
    const probe=document.createElement('span');probe.style.color=`var(${token})`;el.append(probe);
    const matches=getComputedStyle(el).color===getComputedStyle(probe).color;probe.remove();return matches;
   },token);
   assert(matches,`${selector} follows the ${token} palette`);
  }
  for(const selector of ['#chapter-06 h2 em','.mobius-caption h3 span']){
   const gradient=await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return s.backgroundImage.includes('linear-gradient')&&s.backgroundClip==='text'});
   assert(gradient,`${selector}: the shared-surface reveal retains its blended accent`);
  }
  assert.deepEqual(await page.locator('#mirror-installation [data-voice]').allTextContents(),['不能失去自己','不能没有你']);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  console.log(`PASS ${width}: paper-white titles, selective story accents and original serif dedication`);
  await page.close();
 }
}finally{await browser.close()}
