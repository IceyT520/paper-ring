import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';
const url=(process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate)+'#mobius-section';
const browser=await launchBrowser();
fs.mkdirSync('test-results/finale',{recursive:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width>760?960:844},reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
   window.__filmFrames=[];window.__settledPaperUploads=0;
   const upload=WebGL2RenderingContext.prototype.bufferSubData;
   WebGL2RenderingContext.prototype.bufferSubData=function(...args){
    if(this.canvas.parentElement?.id==='finale-stage'&&+document.querySelector('#connection-film').dataset.progress>13/22&&args[2]?.byteLength===5220)window.__settledPaperUploads++;
    return upload.apply(this,args);
   };
   const clear=WebGL2RenderingContext.prototype.clear;
   WebGL2RenderingContext.prototype.clear=function(...args){if(this.canvas.parentElement?.id==='finale-stage')window.__filmFrames.push(performance.now());return clear.apply(this,args)};
  });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'load'});
  await page.waitForSelector('#mobius-stage.ready');
  assert.equal(await page.locator('#watch-finale').count(),1,'the paper installation offers an independent film');
  const original=await page.locator('#mobius-stage').getAttribute('data-paper-progress');
  await page.locator('#watch-finale').click();
  await page.waitForSelector('#connection-film[data-state=playing]');
  await page.waitForSelector('#finale-stage.ready');
  await page.waitForTimeout(1800);
  await page.locator('#finale-pause').click();
  await page.waitForTimeout(120);
  const pausedDraws=await page.evaluate(()=>window.__filmFrames.length);
  const progress=await page.locator('#connection-film').getAttribute('data-progress');
  const scroll=await page.evaluate(()=>scrollY);
  await page.mouse.wheel(0,650);await page.keyboard.press('PageDown');await page.waitForTimeout(300);
  assert.equal(await page.locator('#connection-film').getAttribute('data-progress'),progress,'pause holds the complete performance');
  assert.equal(await page.evaluate(()=>scrollY),scroll,'a modal film cannot scroll the underlying article');
  assert.equal(await page.evaluate(()=>window.__filmFrames.length),pausedDraws,'a paused film stops drawing');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#connection-film:not([open])',{state:'attached'});
  assert.equal(await page.evaluate(()=>document.activeElement.id),'watch-finale','exit restores keyboard focus');
  await page.waitForSelector('#mobius-stage.ready');
  assert.equal(await page.locator('#mobius-stage').getAttribute('data-paper-progress'),original,'a film does not change the reader’s selected shape');
  await page.locator('#watch-finale').click();
  await page.waitForSelector('#connection-film[data-state=playing]');
  await page.waitForTimeout(400);
  const cadence=await page.evaluate(async()=>{
   const count=window.__filmFrames.length,start=performance.now();let frames=0;
   await new Promise(resolve=>{function sample(now){frames++;if(now-start<2000)requestAnimationFrame(sample);else resolve()}requestAnimationFrame(sample)});
   return(window.__filmFrames.length-count)/frames;
  });
  assert(cadence>.8,`film updates must not fall onto alternate display frames: ${cadence}`);
  await page.waitForFunction(()=>+document.querySelector('#connection-film').dataset.progress>.54);
  await page.screenshot({path:`test-results/finale/reconnect-${width}.png`});
  await page.waitForSelector('#connection-film[data-state=ended]',{timeout:24000});
  await page.waitForTimeout(120);
  const endedDraws=await page.evaluate(()=>window.__filmFrames.length);
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>window.__filmFrames.length),endedDraws,'the final still does not keep rendering');
  assert.equal(await page.evaluate(()=>window.__settledPaperUploads),0,'the closed, unchanging paper is not rebuilt or uploaded every frame');
  const fit=await page.locator('#connection-film').evaluate(el=>{
   const controls=[...el.querySelectorAll('button:not([hidden]),.finale-caption,.finale-stage')].filter(b=>!b.disabled).map(b=>b.getBoundingClientRect());
   return{fits:controls.every(r=>r.x>=0&&r.right<=innerWidth+1&&r.y>=0&&r.bottom<=innerHeight+1),canvases:document.querySelectorAll('canvas[data-paper-renderer]').length,overflow:el.scrollWidth>el.clientWidth+1};
  });
  assert(fit.fits,'every playback control fits the viewport');assert(!fit.overflow);assert.equal(fit.canvases,1,'film reuses the existing renderer');
  await page.screenshot({path:`test-results/finale/end-${width}.png`});
  await page.locator('#finale-replay').click();
  await page.waitForSelector('#connection-film[data-state=playing]');
  assert(+await page.locator('#connection-film').getAttribute('data-progress')<.1,'replay begins at the first scene');
  await page.locator('#finale-close').click();
  await page.waitForSelector('#mobius-stage.ready');
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}: film, pause, replay, escape, original state, shared canvas and viewport controls`);
  await page.close();
 }
 for(const fallback of ['reduced','no-webgl']){
  const page=await browser.newPage({viewport:{width:360,height:640},reducedMotion:fallback==='reduced'?'reduce':'no-preference'});
  if(fallback==='no-webgl')await page.addInitScript(()=>{
   const get=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:get.call(this,type,...args)};
  });
  await page.goto(url,{waitUntil:'load'});
  await page.locator('#watch-finale').click();
  await page.waitForSelector('#connection-film[data-state=still]');
  assert(await page.locator('#finale-pause').isDisabled());
  await page.locator('#finale-close').click();
  assert.equal(await page.locator('#exhibition [data-original]').count(),71);
  console.log(`PASS ${fallback}: complete static coda and normal exit`);
  await page.close();
 }
}finally{await browser.close()}
