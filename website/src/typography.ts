/** Center the visible words of each display line, letting punctuation hang beside them.
 * Runs after fonts load and when layout changes; never runs on scroll or animation frames.
 */
export function initOpticalTitles(onLayout:()=>void){
 const selector='.large-quote,.flow-study figcaption h3,.mobius-coda h3,.conclusion h2,.dedication h2,.dedication-title';
 const titles=[...document.querySelectorAll<HTMLElement>(selector)].map(el=>({el,html:el.innerHTML,width:el.offsetWidth}));
 const context=document.createElement('canvas').getContext('2d');if(!context)return;
 let timer:ReturnType<typeof setTimeout>|undefined,ready=false;
 type Glyph={node:Text;start:number;end:number;character:string;x:number;right:number;top:number;font:string};
 function align(){
  timer=undefined;
  for(const item of titles){
   const {el}=item;if(!el.offsetWidth)continue;
   el.innerHTML=item.html;
   if(getComputedStyle(el).textAlign!=='center')continue;
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),lines:Glyph[][]=[];
   let node:Node|null;
   while((node=walker.nextNode())){
    const text=node as Text,style=getComputedStyle(text.parentElement!);
    const font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    let offset=0;
    for(const character of text.data){
     const start=offset;offset+=character.length;if(!character.trim())continue;
     const range=document.createRange();range.setStart(text,start);range.setEnd(text,offset);
     const box=range.getBoundingClientRect();if(!box.width)continue;
     const glyph:Glyph={node:text,start,end:offset,character,x:box.x,right:box.right,top:box.top,font};
     let line=lines.at(-1);if(!line||Math.abs(line[0].top-box.top)>3){line=[];lines.push(line)}line.push(glyph);
    }
   }
   const box=el.getBoundingClientRect(),center=box.x+box.width/2,output=document.createDocumentFragment();
   for(const line of lines){
    const words=line.filter(g=>/[\p{L}\p{N}]/u.test(g.character));if(!words.length)continue;
    const first=words[0],last=words.at(-1)!;
    context!.font=first.font;const left=first.x-context!.measureText(first.character).actualBoundingBoxLeft;
    context!.font=last.font;const right=last.x+context!.measureText(last.character).actualBoundingBoxRight;
    const span=document.createElement('span');span.className='optical-title-line';
    span.style.setProperty('--optical-shift',`${(center-(left+right)/2).toFixed(3)}px`);
    const range=document.createRange();range.setStart(line[0].node,line[0].start);range.setEnd(line.at(-1)!.node,line.at(-1)!.end);
    let fragment:Node=range.cloneContents();
    // Range.cloneContents omits the common ancestor; retain an enclosing <em>'s color.
    let ancestor=range.commonAncestorContainer.nodeType===Node.TEXT_NODE?range.commonAncestorContainer.parentElement:range.commonAncestorContainer as HTMLElement;
    while(ancestor&&ancestor!==el){const wrapper=ancestor.cloneNode(false);wrapper.appendChild(fragment);fragment=wrapper;ancestor=ancestor.parentElement}
    span.appendChild(fragment);output.appendChild(span);
   }
   if(output.childNodes.length)el.replaceChildren(output);
  }
  onLayout();
 }
 function schedule(){if(!ready)return;clearTimeout(timer);timer=setTimeout(align,120)}
 const observer=new ResizeObserver(entries=>{
  let changed=false;
  for(const entry of entries){const item=titles.find(t=>t.el===entry.target)!;const width=entry.target.getBoundingClientRect().width;if(Math.abs(width-item.width)>.5){item.width=width;changed=true}}
  if(changed)schedule();
 });
 titles.forEach(({el})=>observer.observe(el));window.addEventListener('resize',schedule,{passive:true});
 document.fonts.ready.then(()=>{ready=true;align()});
}
