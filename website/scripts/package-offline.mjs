import {build} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import {root,projectRoot,offlineHtml,sourcePdf} from './paths.mjs';
const result=await build({configFile:false,root,logLevel:'warn',build:{write:false,target:'es2022',minify:'esbuild',lib:{entry:path.join(root,'src/main.ts'),name:'PaperExhibition',formats:['iife']},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=Array.isArray(result)?result[0].output:result.output;
const js=output.find(x=>x.type==='chunk').code.replace(/<\/script/gi,'<\\/script');
let fonts=fs.readFileSync(path.join(root,'public/fonts/fonts.css'),'utf8');
fonts=fonts.replace(/url\('\.\/([^']+)'\)/g,(_,name)=>`url('data:font/${name.endsWith('woff2')?'woff2':'woff'};base64,${fs.readFileSync(path.join(root,'public/fonts',name)).toString('base64')}')`);
const css=fs.readFileSync(path.join(root,'src/style.css'),'utf8').replace('@charset "UTF-8";','');
const journeyCSS=fs.readFileSync(path.join(root,'src/journey.css'),'utf8');
const icon=encodeURIComponent(fs.readFileSync(path.join(root,'public/favicon.svg'),'utf8'));
// The soundtrack travels inside the single file, so one HTML is enough to share.
const track=path.join(root,'public/theme.mp3');
const hasTrack=fs.existsSync(track);
const inline=hasTrack?`<script>window.__paperTrack="${fs.readFileSync(track).toString('base64')}";</script>`:'';
let html=fs.readFileSync(path.join(root,'index.html'),'utf8')
 .replace('<link rel="stylesheet" href="/fonts/fonts.css">',()=>`<style>${fonts}</style>`)
 .replace('<link rel="stylesheet" href="/src/style.css">',()=>`<style>${css}</style>`)
 .replace('<link rel="stylesheet" href="/src/journey.css">',()=>`<style>${journeyCSS}</style>`)
 .replace('href="/favicon.svg"',()=>`href="data:image/svg+xml,${icon}"`)
 .replaceAll('href="./paper.pdf"',`href="./${encodeURIComponent(path.basename(sourcePdf))}"`)
 .replace('<script type="module" src="/src/main.ts"></script>',()=>`${inline}<script>${js}</script>`);
fs.writeFileSync(offlineHtml,html);
// A stale sibling copy would be misleading now that the audio is embedded.
const published=path.join(projectRoot,'theme.mp3');
if(fs.existsSync(published))fs.rmSync(published);
console.log(hasTrack?'Soundtrack: embedded in the single file (no sibling mp3 needed)':'Soundtrack: none — the exhibition stays silent and hides the control');
console.log(`Offline exhibition: ${offlineHtml} (${Math.round(Buffer.byteLength(html)/1024)} KiB)`);
