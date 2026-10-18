import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true}),report=[];
try{
 for(const width of [1440,768,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
  // Use actual DOM character advances, independent of the production canvas ink metrics.
  // Trailing punctuation should hang beside the centered words, not displace them.
  const lines=await page.evaluate(()=>{
   const results=[];
   for(const el of document.querySelectorAll('.large-quote,.flow-study figcaption h3,.mobius-coda h3,.conclusion h2,.dedication h2,.dedication-title')){
    if(getComputedStyle(el).textAlign!=='center')continue;
    const rows=new Map(),walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode())for(let i=0;i<node.length;i++){
     if(!/\p{L}|\p{N}/u.test(node.textContent[i]))continue;
     const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+1);const b=r.getBoundingClientRect(),y=Math.round(b.y),s=getComputedStyle(node.parentElement);
     let row=rows.get(y);if(!row){row={text:'',left:b.left,right:b.right,tracking:parseFloat(s.letterSpacing)||0};rows.set(y,row)}
     row.text+=node.textContent[i];row.right=b.right;
    }
    for(const row of rows.values())results.push({...row,offset:(row.left+row.right-row.tracking)/2-document.documentElement.clientWidth/2});
   }
   return results;
  });
  for(const line of lines)assert(Math.abs(line.offset)<4,`${width}px: ${line.text} is displaced ${line.offset.toFixed(2)}px`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  report.push({width,lines});console.log('PASS title centers',width,Math.max(...lines.map(l=>Math.abs(l.offset))).toFixed(2)+'px');await page.close();
 }
 fs.writeFileSync('test-results/title-centering-report.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
