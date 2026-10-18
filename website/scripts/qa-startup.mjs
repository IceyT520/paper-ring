import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {offlineUrl} from './paths.mjs';

const browser=await chromium.launch({channel:'msedge',headless:true});
const offline=process.argv.includes('--offline');
const url=offline?offlineUrl:'http://127.0.0.1:4173/';
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 // Delay only the optional renderer: its old placeholder must never flash first.
 if(!offline)await page.route('**/src/paper.ts',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue()});
 await page.addInitScript(()=>{
  window.startupFrames=[];
  const start=performance.now();
  function sample(){
   const stage=document.querySelector('#hero-stage'),fallback=stage?.querySelector('.ring-fallback');
   if(fallback){let opacity=1;for(let el=fallback;el;el=el.parentElement){const s=getComputedStyle(el);opacity*=Number(s.opacity);if(s.visibility==='hidden'||s.display==='none')opacity=0}
    window.startupFrames.push({time:performance.now(),fallbackOpacity:opacity,ready:stage.classList.contains('ready'),running:document.documentElement.dataset.opening==='running'});
   }
   if(performance.now()-start<3500)requestAnimationFrame(sample);
  }requestAnimationFrame(sample);
 });
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('#hero-stage.ready',{timeout:5000});await page.waitForTimeout(100);
 const frames=await page.evaluate(()=>window.startupFrames);
 assert(frames.some(s=>!s.ready),'exercise the pending renderer');
 assert(!frames.some(s=>s.fallbackOpacity>.001),'flat placeholder must not flash before the 3D paper');
 assert(!frames.some(s=>s.running&&!s.ready),'opening must wait for the first rendered paper frame');
 console.log('PASS renderer warmup: no placeholder flash and no opening during setup');
 await page.close();
}finally{await browser.close()}
