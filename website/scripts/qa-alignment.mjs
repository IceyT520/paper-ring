import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await launchBrowser();
const offline=process.argv.includes('--offline');
const url=offline?offlineUrlNoGate:devUrlNoGate;
const report=[];
try{
 for(const [width,height] of [[1440,1000],[768,1024],[390,844],[360,800]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.locator('#send-signal').click();await page.waitForTimeout(1900);
  async function checkDock(){
   const result=await page.evaluate(()=>{
    const a=document.querySelector('#send-signal'),b=document.querySelector('.letter-destination'),ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
    const m=new DOMMatrixReadOnly(getComputedStyle(a).transform),dest=new DOMMatrixReadOnly(getComputedStyle(b).transform);
    const scale=Math.hypot(m.a,m.b);
    return{centerError:Math.hypot(ar.x+ar.width/2-br.x-br.width/2,ar.y+ar.height/2-br.y-br.height/2),angleError:Math.abs(Math.atan2(m.b,m.a)-Math.atan2(dest.b,dest.a)),width:a.offsetWidth*scale,height:a.offsetHeight*scale,boxWidth:b.clientWidth,boxHeight:b.clientHeight};
   });
   assert(result.centerError<1,JSON.stringify(result));assert(result.angleError<.00001);assert(result.width<result.boxWidth-10);assert(result.height<result.boxHeight-10);return result;
  }
  const dock=await checkDock();await page.screenshot({path:`test-results/v5-letter-${width}.png`});
  await page.setViewportSize({width:width+17,height});await page.waitForTimeout(100);await checkDock();assert(await page.locator('.letter-flight').evaluate(el=>el.classList.contains('arrived')));
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  for(let i=0;i<4;i++)await page.locator(`[data-promise="${i}"]`).click();await page.waitForTimeout(1350);
  const geometry=await page.evaluate(()=>{
   // Inspect rendered paths rather than duplicating the formula that created them.
   function nearest(path,x,y){const length=path.getTotalLength();let best=Infinity;for(let k=0;k<=2400;k++){const p=path.getPointAtLength(length*k/2400);best=Math.min(best,Math.hypot(p.x-x,p.y-y))}return best}
   const anchors=[...document.querySelectorAll('.stitch-anchor')].map(c=>nearest(document.querySelector(`#rhythm-${c.dataset.anchor}`),Number(c.getAttribute('cx')),Number(c.getAttribute('cy'))));
   const crossings=[...document.querySelectorAll('.weave-crossing .node')].flatMap(c=>[...document.querySelectorAll('.study-weave .contour')].map(path=>nearest(path,Number(c.getAttribute('cx')),Number(c.getAttribute('cy')))));
   const controls=[...document.querySelectorAll('.stitch-pin')].map(p=>p.getBoundingClientRect().top);
   const art=document.querySelector('#rhythm-svg').getBoundingClientRect();
   const bands=[...document.querySelectorAll('.ribbon-body')].map(p=>p.getBoundingClientRect().bottom);
   return{anchorError:Math.max(...anchors),crossingError:Math.max(...crossings),controlGap:Math.min(...controls)-Math.max(...bands),artBottom:art.bottom};
  });
  assert(geometry.anchorError<.5,JSON.stringify(geometry));assert(geometry.crossingError<.5,JSON.stringify(geometry));assert(geometry.controlGap>10,JSON.stringify(geometry));
  await page.locator('.rhythm-instrument').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/v5-loom-${width}.png`});
  await page.locator('.study-weave').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);await page.screenshot({path:`test-results/v5-crossings-${width}.png`});
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  report.push({width,dock,geometry});console.log('PASS alignment',width,JSON.stringify({dock,geometry}));await page.close();
 }
 fs.writeFileSync('test-results/alignment-report.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
