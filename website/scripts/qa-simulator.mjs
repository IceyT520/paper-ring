import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';

const offline=process.argv.includes('--offline');
const url=offline?offlineUrlNoGate:devUrlNoGate;
const browser=await launchBrowser();
fs.mkdirSync('test-results',{recursive:true});

async function checkLabels(page){
 const labels=await page.evaluate(()=>Array.from(document.querySelectorAll('#time-chart text,#phase-chart text'),el=>{
  const box=el.getBBox(),svg=el.ownerSVGElement,view=svg.viewBox.baseVal;
  return {text:el.textContent,x:box.x,right:box.x+box.width,y:box.y,bottom:box.y+box.height,
   width:view.width,height:view.height,fontPixels:parseFloat(getComputedStyle(el).fontSize)*svg.getBoundingClientRect().width/view.width};
 }));
 for(const label of labels){
  assert(!/\d[eE][+-]\d/.test(label.text),`scientific notation: ${label.text}`);
  assert(label.x>=-.5&&label.right<=label.width+.5&&label.y>=-.5&&label.bottom<=label.height+.5,`clipped label: ${JSON.stringify(label)}`);
  assert(label.fontPixels>=9,`unreadable scale: ${JSON.stringify(label)}`);
 }
 const description=await page.locator('#chart-description').textContent();
 assert(!/\d[eE][+-]\d|NaN|Infinity/.test(description),description);
}

try{
 for(const width of [360,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',offline});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${url}#chapter-08`,{waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('#time-chart path'));
  const order=await page.evaluate(()=>{
   const source=document.querySelector('.model-source').getBoundingClientRect();
   const guide=document.querySelector('.sim-intro').getBoundingClientRect();
   const sim=document.querySelector('#simulator').getBoundingClientRect();
   return source.bottom<=guide.top&&guide.bottom<=sim.top;
  });
  assert(order,'model explanation and reading guide must precede the interactive chart');
  assert.equal(await page.locator('.model-source [data-original]').count(),6);
  assert(await page.locator('#model-description').isVisible(),'model assumptions must remain visible on small screens');
  for(const preset of ['critical','near','far','growth']){
   await page.locator(`[data-preset="${preset}"]`).click();
   await checkLabels(page);
  }
  assert.match(await page.locator('#chart-description').textContent(),/A=2,406，R=4,167/);
  await page.locator('#simulator').screenshot({path:`test-results/simulator-${width}.png`});
  await page.evaluate(()=>{
   for(const [key,value] of Object.entries({alpha:8,beta:.2,gamma:8,delta:.2,D:.2})){
    const input=document.querySelector(`[data-param="${key}"]`);
    input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));
   }
  });
  assert(Number(await page.locator('#time-chart').getAttribute('data-max'))>10000);
  assert.match(await page.locator('#chart-description').textContent(),/超过 10,000/);
  await checkLabels(page);
  await page.locator('[data-model="bounded"]').click();
  assert(Number(await page.locator('#time-chart').getAttribute('data-max'))<=1);
  assert.match(await page.locator('#model-description').textContent(),/扩展假设/);
  await checkLabels(page);
  await page.locator('#sim-reset').click();
  await page.locator('[data-model="linear"]').click();
  assert.equal(await page.locator('#value-D').textContent(),'9.00');
  assert.equal(await page.locator('[data-equilibrium="line"]').count(),1);
  if(width===1440){
   await page.locator('[data-preset="growth"]').click();
   await page.setViewportSize({width:390,height:844});
   // Wait for the page's responsive layout and the chart to agree on their width.
   await page.waitForFunction(()=>{
    const svg=document.querySelector('#time-chart'),width=svg.getBoundingClientRect().width;
    return width>=innerWidth*.75&&svg.viewBox.baseVal.width===Math.round(width);
   });
   await checkLabels(page);
   assert.match(await page.locator('#chart-description').textContent(),/A=2,406，R=4,167/);
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px: explanation first; readable decimal labels; all regimes; bounded assumptions; reset${width===1440?'; resize preserves state':''}`);
  await context.close();
 }
}finally{await browser.close()}
