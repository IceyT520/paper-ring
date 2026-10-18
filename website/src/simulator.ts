import {DEFAULT_PARAMETERS,criticalDistance,regime,simulate,derivative,boundedEquilibrium,type Parameters,type ModelMode} from './model';
const anx='#ee8a80',avd='#72b7ef',grid='#9ebddf22';
const fmt=(v:number)=>v>=1000?v.toExponential(1):v>=10?v.toFixed(0):v>=1?v.toFixed(1):v.toFixed(2);
function nice(v:number){const base=10**Math.floor(Math.log10(Math.max(v,.01)));const r=v/base;return(r<=1?1:r<=2?2:r<=5?5:10)*base}
export function initSimulator(){
 let p:Parameters={...DEFAULT_PARAMETERS},mode:ModelMode='linear';
 const time=document.querySelector<SVGSVGElement>('#time-chart')!,phase=document.querySelector<SVGSVGElement>('#phase-chart')!;
 function update(){
   document.querySelectorAll<HTMLInputElement>('[data-param]').forEach(el=>{
     const key=el.dataset.param as keyof Parameters;
     if(key==='D')el.max=String(Math.max(12,p.D*1.1));
     el.value=String(p[key]);document.querySelector(`#value-${key}`)!.textContent=p[key].toFixed(key==='D'?2:1);
   });
   document.querySelectorAll<HTMLButtonElement>('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===mode)));
   const result=simulate(p,mode),samples=result.samples,last=samples.at(-1)!;
   const yMax=mode==='bounded'?1:nice(Math.max(1,...samples.flatMap(s=>[s.A,s.R]))),tMax=last.t;
   time.dataset.max=String(Math.max(...samples.flatMap(s=>[s.A,s.R])));
   time.dataset.mode=mode;
   const x=(t:number)=>48+t/tMax*646,y=(v:number)=>255-v/yMax*225;
   const tick=Array.from({length:6},(_,i)=>{const v=i*yMax/5,xx=48+i*646/5;return `<path d="M48 ${y(v)}H694" stroke="${grid}"/><text x="37" y="${y(v)+3}" text-anchor="end">${fmt(v)}</text><text x="${xx}" y="278" text-anchor="middle">${(i*tMax/5).toFixed(1)}</text>`}).join('');
   const trace=(key:'A'|'R',color:string)=>`<path d="${samples.map((s,i)=>`${i?'L':'M'}${x(s.t).toFixed(2)},${y(s[key]).toFixed(2)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><circle cx="${x(last.t)}" cy="${y(last[key])}" r="3" fill="${color}"/>`;
   time.innerHTML=`<title>${mode==='linear'?'原文线性':'有界扩展'}：A 与 R 随时间变化</title>${tick}<text x="694" y="297" text-anchor="end">时间 t →</text>${trace('A',anx)}${trace('R',avd)}`;
   const xMax=mode==='bounded'?1:nice(Math.max(1,...samples.map(s=>s.A)));
   const rMax=mode==='bounded'?1:nice(Math.max(1,...samples.map(s=>s.R)));
   const px=(a:number)=>40+a/xMax*270,py=(r:number)=>245-r/rMax*220;
   let field='';
   for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){
     const a=i*xMax/8,r=j*rMax/8,[da,dr]=derivative(a,r,p,mode);
     const sx=da/xMax,sy=dr/rMax,m=Math.hypot(sx,sy);if(m<1e-9)continue;
     const ux=sx/m,uy=-sy/m,xx=px(a),yy=py(r),endX=xx+ux*8,endY=yy+uy*8;
     field+=`<path d="M${xx} ${yy}l${ux*8} ${uy*8}m${-ux*3+uy*2} ${-uy*3-ux*2}L${endX} ${endY}l${-ux*3-uy*2} ${-uy*3+ux*2}" stroke="#96b9dc70" stroke-width=".8" fill="none"/>`;
   }
   let eq='';
   if(mode==='linear'&&regime(p)==='critical'){
     const limit=Math.min(xMax,rMax*p.delta/p.gamma);
     eq=`<path data-equilibrium="line" d="M${px(0)} ${py(0)}L${px(limit)} ${py(limit*p.gamma/p.delta)}" stroke="#a4935e" stroke-width="1.5" stroke-dasharray="5 4"/>`;
   }else if(mode==='bounded'){
     const e=boundedEquilibrium(p);eq=`<circle cx="${px(e.A)}" cy="${py(e.R)}" r="5" fill="none" stroke="#8b8f61" stroke-width="1.5"/>`;
   }
   phase.innerHTML=`<title>相平面与方向场${regime(p)==='critical'?'，虚线为原文线性平衡线':''}</title><defs><clipPath id="phase-clip"><rect x="38" y="23" width="274" height="224"/></clipPath></defs>${[0,.5,1].map(f=>`<path d="M40 ${py(f*rMax)}H310M${px(f*xMax)} 25V245" stroke="${grid}"/><text x="${px(f*xMax)}" y="263" text-anchor="middle">${fmt(f*xMax)}</text><text x="32" y="${py(f*rMax)+3}" text-anchor="end">${fmt(f*rMax)}</text>`).join('')}<g clip-path="url(#phase-clip)">${field}${eq}<path d="${samples.map((s,i)=>`${i?'L':'M'}${px(s.A).toFixed(2)},${py(s.R).toFixed(2)}`).join(' ')}" stroke="#d8c5a5" stroke-width="1.8" fill="none"/><circle cx="${px(last.A)}" cy="${py(last.R)}" r="3" fill="${anx}"/></g><text x="309" y="284" text-anchor="end">A 焦虑 →</text><text x="40" y="13">R 回避 ↑</text>`;
   if(mode==='bounded')phase.querySelector('title')!.textContent='有界扩展：相平面、方向场与平衡点';
   document.querySelector('#critical-value')!.textContent=criticalDistance(p).toFixed(2);
   const state=regime(p);
   const status=mode==='linear'?(state==='critical'?'临界 · 存在一条非零平衡线，落点取决于初始状态。':state==='growth'?'放大区 · 相互作用超过自我衰减，变量随时间增长。':'衰减区 · A 与 R 最终趋近于零。'):(p.D<criticalDistance(p)?'有界扩展 · 交叉作用随强度饱和，趋向非零平台。':'有界扩展 · 两个变量趋近于零。');
   document.querySelector('#sim-status')!.textContent=status;
   document.querySelector('#chart-description')!.textContent=`t=${last.t.toFixed(2)} 时，A=${fmt(last.A)}，R=${fmt(last.R)}。${result.truncated?'数值超过 10,000，演示在此提前结束；数据未裁剪。':mode==='linear'&&yMax>1?'纵轴自动扩展：原文线性方程可超出 [0,1]。':'数值描述情绪变量，不代表关系评分。'}`;
   document.querySelector('#model-description')!.textContent=mode==='linear'?'原文线性模型。曲线忠实计算，不将数值截断到 0–1。':'扩展假设：交叉作用分别乘以 (1−A)、(1−R)，令强度在 [0,1] 内饱和。';
   document.querySelector('#model-equations')!.innerHTML=mode==='linear'?'dA/dt = αR/D − βA<br>dR/dt = γA − δR':'dA/dt = α(R/D)(1−A) − βA<br>dR/dt = γA(1−R) − δR';
 }
 document.querySelectorAll<HTMLInputElement>('[data-param]').forEach(el=>el.addEventListener('input',()=>{p[el.dataset.param as keyof Parameters]=Number(el.value);update()}));
 document.querySelectorAll<HTMLButtonElement>('[data-model]').forEach(el=>el.addEventListener('click',()=>{mode=el.dataset.model as ModelMode;update()}));
 document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(el=>el.addEventListener('click',()=>{
   const key=el.dataset.preset;if(key==='typical')p={...DEFAULT_PARAMETERS};
   else p.D=criticalDistance(p)*(key==='critical'?1:key==='near'?.45:1.3);update();
 }));
 document.querySelector('#sim-reset')!.addEventListener('click',()=>{p={...DEFAULT_PARAMETERS};update()});
 update();
}
