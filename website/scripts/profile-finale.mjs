import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate} from './paths.mjs';
const label=process.argv[2]||'current',browser=await launchBrowser();
fs.mkdirSync('test-results/finale-profile',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:2});
 await page.addInitScript(()=>{
  window.__filmSamples=[];window.__filmUploads=[];
  const proto=WebGL2RenderingContext.prototype,clear=proto.clear,upload=proto.bufferSubData;
  proto.clear=function(...args){if(this.canvas.parentElement?.id==='finale-stage')window.__filmSamples.push({at:performance.now(),progress:+document.querySelector('#connection-film').dataset.progress});return clear.apply(this,args)};
  proto.bufferSubData=function(...args){if(this.canvas.parentElement?.id==='finale-stage')window.__filmUploads.push({progress:+document.querySelector('#connection-film').dataset.progress,bytes:args[2]?.byteLength||0});return upload.apply(this,args)};
 });
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 await page.goto(devUrlNoGate+'#mobius-section',{waitUntil:'networkidle'});
 await page.waitForSelector('#mobius-stage.ready');
 const before=await cdp.send('Performance.getMetrics');
 await page.locator('#watch-finale').click();
 for(const [name,t] of [['opening',1.4],['turn',7],['connected',16],['end',22]]){
  await page.waitForFunction(t=>+document.querySelector('#connection-film').dataset.progress>=t/22,t,{timeout:26000});
  await page.screenshot({path:`test-results/finale-profile/${label}-${name}.png`});
 }
 const after=await cdp.send('Performance.getMetrics');
 const report=await page.evaluate(()=>{
  const frames=window.__filmSamples,uploads=window.__filmUploads;
  const phases={opening:[0,3],turn:[4,11],connected:[13,21]};
  return Object.fromEntries(Object.entries(phases).map(([name,[a,b]])=>{
   const f=frames.filter(f=>f.progress>=a/22&&f.progress<=b/22),dt=f.slice(1).map((x,i)=>x.at-f[i].at).sort((a,b)=>a-b);
   return[name,{frames:f.length,fps:+((f.length-1)*1000/(f.at(-1).at-f[0].at)).toFixed(1),p95:+dt[Math.floor(dt.length*.95)].toFixed(1),paperUploads:uploads.filter(f=>f.progress>=a/22&&f.progress<=b/22&&f.bytes===5220).length}];
  }));
 });
 for(const name of ['ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount'])report[name]=(after.metrics.find(m=>m.name===name)?.value||0)-(before.metrics.find(m=>m.name===name)?.value||0);
 fs.writeFileSync(`test-results/finale-profile/${label}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}
