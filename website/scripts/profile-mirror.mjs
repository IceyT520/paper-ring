import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchBrowser} from './browser.mjs';
import {offlineUrlNoGate} from './paths.mjs';

const browser=await launchBrowser(),report=[];
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1200}});
  await page.goto(offlineUrlNoGate+'#chapter-06',{waitUntil:'networkidle'});
  await page.locator('#mirror-installation').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-180,behavior:'instant'}));
  await page.waitForTimeout(2000);
  const result=await page.evaluate(async()=>{
   const frames=[],longTasks=[];
   const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));
   observer.observe({type:'longtask'});
   const scene=document.querySelector('#mirror-installation'),button=document.querySelector('#connection-meet');
   button.click();
   await new Promise(resolve=>{
    let start=0,last=0;
    function sample(now){
     if(!start)start=now;
     if(last)frames.push(now-last);
     last=now;
     if(now-start<3300)requestAnimationFrame(sample);else resolve();
    }
    requestAnimationFrame(sample);
   });
   observer.disconnect();
   frames.sort((a,b)=>a-b);
   let idleMutations=0;
   const idleObserver=new MutationObserver(list=>idleMutations+=list.length);
   idleObserver.observe(scene,{subtree:true,attributes:true});
   await new Promise(resolve=>setTimeout(resolve,500));idleObserver.disconnect();
   return {frameCount:frames.length,medianFrameMs:frames[Math.floor(frames.length*.5)],p95FrameMs:frames[Math.floor(frames.length*.95)],longTasks,idleMutations,state:scene.dataset.connected};
  });
  assert.equal(result.idleMutations,0,'the settled scene must stop writing geometry and styles');
  assert.equal(result.state,'true');
  const bounds=await page.locator('#mirror-installation').boundingBox();
  await page.screenshot({path:`test-results/mirror-final-${width}.png`,clip:bounds});
  report.push({width,...result});await page.close();
 }
 fs.writeFileSync('test-results/mirror-performance.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}
