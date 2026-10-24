import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.addInitScript(()=>{
 window.__paperFrames=[];window.__measurePaper=false;
 const proto=WebGL2RenderingContext.prototype,original=proto.clear;
 proto.clear=function(...args){if(window.__measurePaper&&this.canvas.parentElement?.id==='mobius-stage')window.__paperFrames.push(performance.now());return original.apply(this,args)};
});
await page.goto('http://127.0.0.1:4173/?nogate=1#mobius-section',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
await page.evaluate(()=>{const el=document.querySelector('#mobius-section');scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'})});
await page.waitForTimeout(600);await page.locator('#mobius-settings summary').click();await page.locator('[data-twist-step="2"]').click();await page.waitForTimeout(2000);
await page.locator('#send-light').click();await page.waitForTimeout(2000);
const report=await page.evaluate(async()=>{
 window.__paperFrames=[];window.__measurePaper=true;
 const start=performance.now();let raf=0;
 await new Promise(resolve=>{function sample(now){raf++;if(now-start<4000)requestAnimationFrame(sample);else resolve()}requestAnimationFrame(sample)});
 window.__measurePaper=false;const times=window.__paperFrames,dt=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);
 return{rendererFrames:times.length,browserFrames:raf,seconds:(performance.now()-start)/1000,rendererFPS:(times.length-1)*1000/(times.at(-1)-times[0]),medianDrawIntervalMs:dt[Math.floor(dt.length*.5)],p95DrawIntervalMs:dt[Math.floor(dt.length*.95)],drawsPerBrowserFrame:times.length/raf};
});
fs.writeFileSync(`test-results/paper-cadence-${process.argv[2]||'latest'}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
