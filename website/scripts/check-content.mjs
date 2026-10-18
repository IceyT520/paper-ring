import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {editedText,corrections} from './editorial.mjs';
import {offlineHtml,sourcePdf} from './paths.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../content/article.json',import.meta.url),'utf8'));
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pdf=fs.readFileSync(new URL('../public/paper.pdf',import.meta.url));
assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'),data.pdfSha256,'PDF copy differs from source');
assert.equal(data.blocks.map(b=>b.text).join(''),data.source,'Missing/reordered source characters');
assert.equal(data.source.length,data.characterCount);
const decode=s=>s.replace(/<[^>]+>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&amp;','&');
const split=html.indexOf('<main id="source-reader"');
for(const [name,part] of [['exhibition',html.slice(0,split)],['reader',html.slice(split)]]){
 const found=[...part.matchAll(/<p class="source-copy" data-original="(p\d+)">([\s\S]*?)<\/p>/g)];
 assert.equal(found.length,data.blocks.length,`${name} block count`);
 for(const b of data.blocks){const copy=found.find(m=>m[1]===b.id);assert(copy,`${name}: missing ${b.id}`);assert.equal(decode(copy[2]),editedText(b),`${name}: unexpected edit in ${b.id}`)}
}
assert.equal(new Set(data.blocks.map(b=>b.chapter)).size,12);
assert.equal(new Set(data.blocks.flatMap(b=>b.pages)).size,10);
assert.equal(data.blocks.filter(b=>b.group==='dedication'&&b.text.startsWith('献给')).length,7);
assert.equal(data.blocks.filter(b=>b.group==='references'&&b.text.startsWith('[')).length,4);
for(const block of data.blocks){
 const text=editedText(block),stack=[];
 for(const char of text){if(char==='“'||char==='‘')stack.push(char);else if(char==='”'||char==='’')assert.equal(stack.pop(),char==='”'?'“':'‘',`Unpaired quote in ${block.id}`)}
 assert.equal(stack.length,0,`Unclosed quote in ${block.id}`);
}
// The single-file build is the shipped artefact: it must carry the same text twice and no external assets.
if(fs.existsSync(offlineHtml)){
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(sourcePdf)).digest('hex'),data.pdfSha256,'Published PDF differs from the archived source');
 const offline=fs.readFileSync(offlineHtml,'utf8');
 const copies=[...offline.matchAll(/<p class="source-copy" data-original="(p\d+)">([\s\S]*?)<\/p>/g)];
 assert.equal(copies.length,data.blocks.length*2,'packaged HTML must hold both reading modes');
 for(const b of data.blocks){
  const pairs=copies.filter(m=>m[1]===b.id);
  assert.equal(pairs.length,2,`packaged HTML: ${b.id} appears ${pairs.length} times`);
  for(const copy of pairs)assert.equal(decode(copy[2]),editedText(b),`packaged HTML: unexpected edit in ${b.id}`);
 }
 assert(offline.includes(`href="./${encodeURIComponent('纸环的两面.pdf')}"`),'packaged HTML must link the PDF beside it');
 assert(!/(src|href)="\/(src|fonts|assets)\//.test(offline),'packaged HTML must not reference site-root assets');
 assert.equal([...offline.matchAll(/id="chapter-\d\d"/g)].length,12,'packaged HTML keeps 12 chapters');
}
console.log(`PASS: ${data.blocks.length} blocks in both modes${fs.existsSync(offlineHtml)?' and in the packaged single file':''}; ${data.characterCount} original characters archived; ${corrections.length} explicit corrections; paired quotations, 12 chapters, 10 pages, 7 dedications, 4 references.`);
