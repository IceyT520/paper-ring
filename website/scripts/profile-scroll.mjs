import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const cdp=await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(1500);
const report={viewport:'1440 × 900',cpuThrottle:4,scenarios:[]};
for(const [name,selector,distance] of [['reading','#chapter-04',5000],['mobius','#mobius-section',1700]]){
 await page.evaluate(s=>scrollTo({top:document.querySelector(s).getBoundingClientRect().top+scrollY,behavior:'instant'}),selector);
 await page.waitForTimeout(800);
 const before=(await cdp.send('Performance.getMetrics')).metrics;
 const frames=await page.evaluate(async distance=>{
  const intervals=[],start=performance.now(),origin=scrollY;let last=start;
  await new Promise(resolve=>{function step(now){intervals.push(now-last);last=now;const t=Math.min(1,(now-start)/5000);scrollTo({top:origin+t*distance,behavior:'instant'});if(t<1)requestAnimationFrame(step);else resolve()}requestAnimationFrame(step)});
  return intervals.slice(1);
 },distance);
 const after=(await cdp.send('Performance.getMetrics')).metrics;
 const metrics=Object.fromEntries(after.map(m=>[m.name,m.value-(before.find(b=>b.name===m.name)?.value||0)]));
 frames.sort((a,b)=>a-b);
 report.scenarios.push({name,frames:frames.length,medianFrameMs:frames[Math.floor(frames.length*.5)],p95FrameMs:frames[Math.floor(frames.length*.95)],framesOver34ms:frames.filter(f=>f>34).length,taskSeconds:metrics.TaskDuration,styleSeconds:metrics.RecalcStyleDuration,layoutSeconds:metrics.LayoutDuration,styleRecalculations:metrics.RecalcStyleCount});
}
fs.writeFileSync(`test-results/performance-${process.argv[2]||'latest'}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));await browser.close();
