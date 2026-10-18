import fs from 'node:fs';
export const corrections=JSON.parse(fs.readFileSync(new URL('../content/corrections.json',import.meta.url),'utf8'));
export function editedText(block){
 let text=block.text;
 for(const c of corrections.filter(c=>c.id===block.id)){
  if(!text.includes(c.from))throw new Error(`Correction no longer matches ${c.id}: ${c.from}`);
  text=text.replace(c.from,c.to);
 }
 return text;
}
