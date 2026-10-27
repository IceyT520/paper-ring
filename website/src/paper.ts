import {fadeText} from './text-motion';
import * as THREE from 'three';
import {paperShape,paperTrace,paperPoint,paperNormal,fitPaperScale} from './paper-geometry';
import {finaleScore} from './finale-score';
export interface PaperController{setOpening(value:number):void;setFinale(seconds:number|null):void;setReduced(value:boolean):void;setTwist(value:number):void;flip():void;resetView():void;nudgeView(x:number,y:number):void;setTracePaused(value:boolean):void;sendLight(phase?:number,offset?:number):void;refresh():void;destroy():void}
export function createPaper(reduced=false):PaperController{
 const slots=[...document.querySelectorAll<HTMLElement>('[data-stage]')];
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'})}catch{
   document.documentElement.classList.add('no-webgl');
   const flip=document.querySelector<HTMLButtonElement>('#flip-ring');if(flip){flip.disabled=true;fadeText(flip,'纸环静态示意')}
   const replay=document.querySelector<HTMLButtonElement>('#replay-twist');if(replay){replay.disabled=true;fadeText(replay,'连接方式示意')}
   return{setOpening(){},setFinale(){},setReduced(){},setTwist(){},flip(){},resetView(){},nudgeView(){},setTracePaused(){},sendLight(){},refresh(){},destroy(){}};
 }
 renderer.setClearColor(0,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.domElement.dataset.paperRenderer='';
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,11.8);
 const ambient=new THREE.AmbientLight('#e9e4d6',.9);scene.add(ambient);
 const key=new THREE.DirectionalLight('#fff1d6',3);key.position.set(-3,5,6);scene.add(key);
 const rim=new THREE.DirectionalLight('#8abef3',2.8);rim.position.set(4,-1,-3);scene.add(rim);
 const warmEdge=new THREE.DirectionalLight('#f1a297',.65);warmEdge.position.set(-4,-2,1);scene.add(warmEdge);
 const fill=new THREE.DirectionalLight('#ffffff',1.2);fill.position.set(1,-3,5);scene.add(fill);
 const group=new THREE.Group();scene.add(group);
 const textureCanvas=document.createElement('canvas');textureCanvas.width=2048;textureCanvas.height=256;
 const ctx=textureCanvas.getContext('2d')!;ctx.fillStyle='#d9d4c7';ctx.fillRect(0,0,2048,256);
 let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 for(let i=0;i<16000;i++){ctx.strokeStyle=`rgba(${rand()>.5?'255,253,244':'85,76,58'},${rand()*.085})`;const x=rand()*2048,y=rand()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*11,y+rand()*1.5);ctx.stroke()}
 ctx.strokeStyle='#6d72602b';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,25);ctx.lineTo(2048,25);ctx.moveTo(0,231);ctx.lineTo(2048,231);ctx.stroke();
 ctx.fillStyle='#6c716342';ctx.font='10px monospace';
 for(let x=50;x<2000;x+=340){ctx.fillText('TWO SIDES / ONE PAPER',x,213);ctx.fillText('01 — ATTACHMENT STUDY',x,45)}
 // The colored paths are ink on each paper face. They share the exact mesh depth.
 const surfaces=Array.from({length:2},()=>{
   const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=256;
   const context=canvas.getContext('2d')!,texture=new THREE.CanvasTexture(canvas);
   texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   return{canvas,context,texture};
 });
 let inkStep=-1;
 function paintLines(twist:number){
   const step=Math.round(twist*30);if(step===inkStep)return;inkStep=step;
   surfaces.forEach(({context,texture},i)=>{
     context.drawImage(textureCanvas,0,0);
     const base=new THREE.Color(i===0?'#df7669':'#508bc8'),other=new THREE.Color(i===0?'#508bc8':'#df7669');
     const gradient=context.createLinearGradient(0,0,2048,0);gradient.addColorStop(0,base.getStyle());gradient.addColorStop(1,base.clone().lerp(other,step/30).getStyle());
     context.fillStyle=gradient;const v=i===0?.28:-.28,y=(.5-v/1.42)*256;context.fillRect(0,y-2.2,2048,4.4);
     texture.needsUpdate=true;
   });
 }
 const mat=new THREE.MeshStandardMaterial({map:surfaces[0].texture,bumpMap:surfaces[0].texture,bumpScale:.025,side:THREE.FrontSide,roughness:.83,metalness:.02});
 const backMat=new THREE.MeshStandardMaterial({map:surfaces[1].texture,color:'#a7b1b1',side:THREE.BackSide,roughness:.85,metalness:.02});
 // The film has neutral paper stock and two clear inks. Its textures are static;
 // turning the paper never requires repainting/uploading a full canvas texture.
 const filmTextures=[0,1].map(i=>{
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=256;
  const c=canvas.getContext('2d')!;c.filter='saturate(0)';c.drawImage(textureCanvas,0,0);c.filter='none';
  c.fillStyle=i?'#639dc5':'#cf7b78';const y=(.5-(i?-.28:.28)/1.42)*256;c.fillRect(0,y-1.7,2048,3.4);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
 });
 const filmMaterials=filmTextures.map((map,i)=>new THREE.MeshPhongMaterial({map,side:i?THREE.BackSide:THREE.FrontSide,shininess:7,specular:'#263440'}));
 // The strip is linear across its width; more subdivisions add no silhouette detail.
 const N=144,M=2,verts=(N+1)*(M+1),positions=new Float32Array(verts*3),normals=new Float32Array(verts*3),uv=new Float32Array(verts*2),indices:number[]=[];
 for(let i=0;i<=N;i++)for(let j=0;j<=M;j++){
   const n=i*(M+1)+j;uv[n*2]=i/N;uv[n*2+1]=j/M;
   if(i<N&&j<M){const a=n,b=n+M+1;indices.push(a,b,a+1,b,b+1,a+1)}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setIndex(indices);geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),3.1);
 const paper=new THREE.Mesh<THREE.BufferGeometry,THREE.Material>(geometry,mat),back=new THREE.Mesh<THREE.BufferGeometry,THREE.Material>(geometry,backMat);group.add(paper,back);
 const edgeLines=[-.71,.71].map(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((N+1)*3),3));const line=new THREE.Line(g,new THREE.LineBasicMaterial({color:'#e8e2d1',transparent:true,opacity:.45}));group.add(line);return line});
 const dotA=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshBasicMaterial({color:'#ffb2a4'}));
 const dotR=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshBasicMaterial({color:'#a7d8ff'}));group.add(dotA,dotR);
 const trailPositions=new Float32Array(24*3),trailGeometry=new THREE.BufferGeometry();trailGeometry.setAttribute('position',new THREE.BufferAttribute(trailPositions,3).setUsage(THREE.DynamicDrawUsage));trailGeometry.boundingSphere=geometry.boundingSphere;
 const trailMaterial=new THREE.PointsMaterial({color:'#ffe0ba',size:.027,transparent:true,opacity:.8,depthWrite:false});const trail=new THREE.Points(trailGeometry,trailMaterial);trail.visible=false;group.add(trail);
 // The film uses the same strip and renderer. Light ribbons are sampled from
 // its actual surface, including the side change, and remain depth-tested.
 const filmGroup=new THREE.Group();filmGroup.visible=false;group.add(filmGroup);
 const FILM_SEGMENTS=512;
 function lightRibbon(width:number,opacity:number){
  const p=new Float32Array((FILM_SEGMENTS+1)*6),colors=new Float32Array(p.length),idx:number[]=[];
  const red=new THREE.Color('#ff9b8a'),blue=new THREE.Color('#7fc9ff');
  for(let i=0;i<=FILM_SEGMENTS;i++){
   const phase=i/FILM_SEGMENTS,color=red.clone().lerp(blue,(1-Math.cos(phase*Math.PI*2))/2);
   for(let j=0;j<2;j++){
    const sample=paperTrace(phase,0,1,.28+(j?width:-width));
    const at=(i*2+j)*3;
    for(let axis=0;axis<3;axis++)p[at+axis]=sample.point[axis]+sample.normal[axis]*sample.side*.018;
    color.toArray(colors,at);
   }
   if(i<FILM_SEGMENTS){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.setIndex(idx);
  const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const mesh=new THREE.Mesh(g,m);filmGroup.add(mesh);return mesh;
 }
 const filmRibbons=[lightRibbon(.009,.88),lightRibbon(.027,.08)];
 // Three small registration strokes cross the actual closed seam on both faces.
 // They appear only at closure, so the connection has a precise visual beat.
 const stitchPoints:number[]=[],stitchColors:number[]=[];
 for(const channel of [0,1])for(const offset of [-.43,0,.43])for(let i=0;i<12;i++)for(const j of [i,i+1]){
  const phase=(j/12-.5)*.023,s=paperTrace(phase,channel,1,offset);
  stitchPoints.push(...s.point.map((x,k)=>x+s.normal[k]*s.side*.022));
  stitchColors.push(...new THREE.Color(channel?'#8dc8ec':'#eaa7a0').toArray());
 }
 const stitchGeometry=new THREE.BufferGeometry();stitchGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stitchPoints,3));stitchGeometry.setAttribute('color',new THREE.Float32BufferAttribute(stitchColors,3));
 const stitches=new THREE.LineSegments(stitchGeometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));filmGroup.add(stitches);
 const seamLights=[0,1].map(i=>{
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(25*3),3).setUsage(THREE.DynamicDrawUsage));
  const m=new THREE.LineBasicMaterial({color:i?'#ffa28c':'#91d2ff',transparent:true,opacity:.85,toneMapped:false});
  const mesh=new THREE.Line(g,m);filmGroup.add(mesh);return mesh;
 });
 const halo=new THREE.Mesh(new THREE.RingGeometry(2.95,2.958,144),new THREE.MeshBasicMaterial({color:'#97b8d1',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));halo.position.z=-1.2;halo.visible=false;scene.add(halo);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const gc=glowCanvas.getContext('2d')!,gradient=gc.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'#f1f3f4');gradient.addColorStop(.16,'#b7d3e477');gradient.addColorStop(1,'#b7d3e400');gc.fillStyle=gradient;gc.fillRect(0,0,64,64);
 const glowTexture=new THREE.CanvasTexture(glowCanvas);glowTexture.colorSpace=THREE.SRGBColorSpace;
 const filmGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));filmGlow.scale.setScalar(.13);filmGroup.add(filmGlow);
 const seamGlows=['#75bdff','#ff998d'].map(color=>{const mesh=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));mesh.scale.setScalar(.1);filmGroup.add(mesh);return mesh});
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 let active:HTMLElement|null=null,mode='hero',frame=0,needsDraw=true,geometryDirty=false,twistProgress=0,twistTarget=0,flipAngle=0,currentFlip=0,dragging=false,lastX=0,lastY=0,dragDistance=0,lastPaint=0;
 const ratios=new Map<HTMLElement,number>();
 const rotations:Record<string,{x:number;y:number}>={explore:{x:0,y:0},mobius:{x:0,y:0}};
 const displayedView:Record<string,{x:number;y:number}>={explore:{x:0,y:0},mobius:{x:0,y:0}};
 let traceClock=0,lastFrame=0,tracePaused=false,lightProgress=-1,lightStart=0,lightOffset=.28,lightMessage=-1,openingProgress=1;
 let pendingLight:{phase:number;offset:number}|undefined;
 let filmSeconds:number|null=null,filmShot=finaleScore(0);
 const lightStatus=document.querySelector<HTMLElement>('#light-status')!;
 function stamp(){if(!active)return;active.dataset.view=JSON.stringify(rotations[mode]||{x:0,y:0});active.dataset.traceState=tracePaused?'paused':'running';active.dataset.paperProgress=String(mode==='mobius'?twistTarget:0)}
 function nudgeView(x:number,y:number){const r=rotations[mode];if(!r)return;r.x+=x;r.y=THREE.MathUtils.clamp(r.y+y,-1.2,1.2);stamp();needsDraw=true;requestFrame()}
 function placeDots(){
  if(mode==='finale'){
   const score=filmShot,phase=score.journey;
   filmGroup.visible=true;halo.visible=true;trail.visible=false;
   dotA.position.fromArray(paperTrace(phase,0,1).center);dotR.position.copy(dotA.position);
   dotA.visible=phase>0;dotR.visible=false;
   filmGlow.visible=phase>0;filmGlow.position.copy(dotA.position);
   stitches.material.opacity=score.joinMarks*.8;
   filmRibbons.forEach(mesh=>mesh.geometry.setDrawRange(0,Math.floor(phase*FILM_SEGMENTS)*6));
   const shape=paperShape(score.twist);
   seamLights.forEach((mesh,k)=>{
    mesh.visible=score.twist>.005&&score.twist<1;mesh.material.opacity=.8*(1-score.warmth);
    seamGlows[k].visible=mesh.visible;
    if(!mesh.visible)return;
    const u=k?Math.PI*2-shape.gap/2:shape.gap/2;
    for(let i=0;i<=24;i++){const v=(i/24-.5)*1.42,p=paperPoint(u,v,shape.twist),n=paperNormal(u,v,shape.twist);mesh.geometry.attributes.position.setXYZ(i,p[0]+n[0]*.018,p[1]+n[1]*.018,p[2]+n[2]*.018)}
    mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.boundingSphere=geometry.boundingSphere;
    const middle=paperPoint(u,0,shape.twist),normal=paperNormal(u,0,shape.twist);
    seamGlows[k].position.set(middle[0]+normal[0]*.06,middle[1]+normal[1]*.06,middle[2]+normal[2]*.06);
    seamGlows[k].material.opacity=mesh.material.opacity;
   });
   halo.scale.setScalar(1+score.pulse*.55);halo.material.opacity=score.pulseOpacity*.22;
   return;
  }
  filmGroup.visible=false;halo.visible=false;
  const progress=mode==='mobius'?twistProgress:0;
  const journey=mode==='mobius'&&lightProgress>=0;
  const drift=mode==='hero'?traceClock*.02:traceClock*.013;
  const phase=journey?lightStart+lightProgress:(reduced?.17:drift);
  // The two people walk at their own pace; the blue dot trails the red one.
  const phaseR=journey?phase:(reduced?.17:drift+.32);
  dotA.position.fromArray(dotPoint(phase,0,progress,journey?lightOffset:.28));
  dotR.position.fromArray(dotPoint(phaseR,1,progress,journey?lightOffset:.28));
  if(active)active.dataset.dots=`${dotA.position.x.toFixed(2)},${dotA.position.y.toFixed(2)},${dotR.position.x.toFixed(2)},${dotR.position.y.toFixed(2)}`;
  trail.visible=journey&&!reduced;
  if(journey){
   for(let i=0;i<24;i++){const p=paperTrace(lightStart+Math.max(0,lightProgress-i*.0035),0,1,lightOffset).center;trailPositions.set(p,i*3)}trailGeometry.attributes.position.needsUpdate=true;
   const message=lightProgress>=1?2:lightProgress>=.5?1:0;
   if(message!==lightMessage){lightMessage=message;fadeText(lightStatus,['光从你的这一面出发，沿着纸面前行。','不曾越过纸边，已经走到了曾经的另一面。','走过两面，回到相遇的地方。原来，我们在同一张纸上。'][message]);if(active)active.dataset.lightJourney=String(message)}
  }
 }
 /** Keep both dots on the paper while the seam closes: the closed Möbius maps
  *  each channel half a lap further, so blend that shift in instead of jumping. */
 function dotPoint(phase:number,channel:number,progress:number,offset:number){
  if(progress<.62)return paperTrace(phase,channel,progress,offset).center;
  const open=paperTrace(phase,channel,Math.min(progress,.999999),offset);
  const closed=paperTrace(phase,channel,1,offset);
  const t=Math.min(1,(progress-.62)/.38),w=t*t*(3-2*t);
  if(!w)return open.center;
  let du=closed.u-open.u;
  while(du>Math.PI)du-=Math.PI*2;
  while(du<-Math.PI)du+=Math.PI*2;
  const u=open.u+du*w,v=open.v+(closed.v-open.v)*w,side=open.side+(closed.side-open.side)*w;
  const shape=paperShape(progress),point=paperPoint(u,v,shape.twist),normal=paperNormal(u,v,shape.twist);
  return point.map((x,i)=>x+normal[i]*side*.075) as [number,number,number];
 }

 function updateGeometry(){
   const {twist,gap}=mode==='finale'?paperShape(filmShot.twist):mode==='mobius'?paperShape(twistProgress):{twist:0,gap:0};
   if(mode!=='finale')paintLines(twist);
   backMat.color.set(mode==='mobius'||mode==='finale'?'#eee3d1':'#a7b1b1');
   for(let i=0;i<=N;i++){
     const u=gap/2+i/N*(Math.PI*2-gap),cu=Math.cos(u),su=Math.sin(u),phi=Math.PI/2*(1-twist)+twist*u/2,c=Math.cos(phi),s=Math.sin(phi);
     for(let j=0;j<=M;j++){
      const v=(j/M-.5)*1.42,r=2.24+v*c,n=(i*(M+1)+j)*3;
      positions[n]=r*cu;positions[n+1]=r*su;positions[n+2]=v*s;
      const dx=-r*su-v*s*twist/2*cu,dy=r*cu-v*s*twist/2*su,dz=v*c*twist/2;
      const nx=dy*s-dz*c*su,ny=dz*c*cu-dx*s,nz=dx*c*su-dy*c*cu,len=Math.hypot(nx,ny,nz);
      normals[n]=nx/len;normals[n+1]=ny/len;normals[n+2]=nz/len;
     }
     for(let k=0;k<2;k++){const v=k===0?-.71:.71,r=2.24+v*c;edgeLines[k].geometry.attributes.position.setXYZ(i,r*cu,r*su,v*s)}
   }
   geometry.attributes.position.needsUpdate=true;geometry.attributes.normal.needsUpdate=true;
   edgeLines.forEach(line=>{line.geometry.attributes.position.needsUpdate=true;line.geometry.boundingSphere=geometry.boundingSphere});
   if(mode!=='finale')dotA.visible=dotR.visible=true;needsDraw=true;geometryDirty=false;
 }
 function resize(){if(!active)return;const r=active.getBoundingClientRect();if(r.width<1||r.height<1)return;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5,Math.sqrt((mode==='finale'?780000:950000)/(r.width*r.height))));renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();needsDraw=true;requestFrame()}
 const ro=new ResizeObserver(resize);
 function choose(){
   if(document.querySelector('#exhibition')?.hasAttribute('hidden')){active?.classList.remove('ready');active=null;return}
   const filmSlot=filmSeconds!==null&&document.querySelector<HTMLDialogElement>('#connection-film')?.open?slots.find(el=>el.dataset.stage==='finale'):undefined;
   const best=filmSlot??[...ratios].filter(([el,n])=>el.dataset.stage!=='finale'&&n>0&&el.getBoundingClientRect().width>0).sort((a,b)=>b[1]-a[1])[0]?.[0];
   if(best&&best!==active){active?.classList.remove('ready');ro.disconnect();active=best;mode=best.dataset.stage!;twistProgress=twistTarget;mat.color.set(mode==='hero'?'#ffffff':'#eee3d1');paper.material=mode==='finale'?filmMaterials[0]:mat;back.material=mode==='finale'?filmMaterials[1]:backMat;best.append(renderer.domElement);ro.observe(best);updateGeometry();resize();stamp();lastFrame=0;
    const film=mode==='finale';ambient.color.set(film?'#dce4eb':'#e9e4d6');key.color.set(film?'#f3f4f5':'#fff1d6');rim.color.set(film?'#7da9cc':'#8abef3');warmEdge.color.set(film?'#c58d92':'#f1a297');renderer.toneMappingExposure=film?1:1.12;
    edgeLines.forEach((line,i)=>{line.material.color.set(film?(i?'#b97c7d':'#7cacc9'):'#e8e2d1');line.material.opacity=film?.7:.45;line.geometry.setDrawRange(0,N+1)});
   }
   else if(!best){active?.classList.remove('ready');ro.disconnect();active=null;}
   requestFrame();
 }
 const io=new IntersectionObserver(entries=>{for(const e of entries)ratios.set(e.target as HTMLElement,e.isIntersecting?e.intersectionRatio:0);choose()},{threshold:[0,.01,.1,.25,.5,.75,1]});slots.forEach(el=>io.observe(el));
 function render(now:number){
   frame=0;if(!active||document.hidden)return;
   // Draw at the display cadence. Damping and speed use elapsed time, never frame count.
   const delta=lastFrame?Math.min(.05,(now-lastFrame)/1000):1/60;lastFrame=now;
   const morphing=mode==='mobius'&&twistProgress!==twistTarget;
   if(morphing){twistProgress=reduced?twistTarget:THREE.MathUtils.lerp(twistProgress,twistTarget,1-Math.exp(-delta/.16));if(Math.abs(twistProgress-twistTarget)<.00003)twistProgress=twistTarget;geometryDirty=true;needsDraw=true}
   if(geometryDirty)updateGeometry();
   if(pendingLight&&twistProgress===1){lightStart=pendingLight.phase;lightOffset=pendingLight.offset;lightProgress=reduced?1:0;lightMessage=-1;pendingLight=undefined;needsDraw=true}
   if(!reduced&&!tracePaused&&mode!=='finale')traceClock+=delta;
   if(mode==='mobius'&&lightProgress>=0&&lightProgress<1&&!tracePaused&&!reduced)lightProgress=Math.min(1,lightProgress+delta/24);
   const move=reduced?0:Math.sin(traceClock*.12)*.025;
   currentFlip=reduced?flipAngle:THREE.MathUtils.lerp(currentFlip,flipAngle,1-Math.exp(-delta/.35));
   let viewMoving=false;
   if(rotations[mode]){const target=rotations[mode],view=displayedView[mode],factor=reduced?1:1-Math.exp(-delta/.075);view.x=THREE.MathUtils.lerp(view.x,target.x,factor);view.y=THREE.MathUtils.lerp(view.y,target.y,factor);viewMoving=Math.abs(view.x-target.x)+Math.abs(view.y-target.y)>.0001;}
   const opening=mode==='hero'?1-openingProgress:0;
   ambient.intensity=.9*(1-.95*opening);key.intensity=3*(1-.97*opening);fill.intensity=1.2*(1-.96*opening);
   rim.intensity=2.8+3.2*Math.sin(Math.PI*opening);warmEdge.intensity=.65*(1-opening);
   key.position.set(-3-4*opening,5,6-4*opening);
   warmEdge.position.set(-4,-2,1);
   if(mode==='finale'){
    const shot=filmShot;
    ambient.intensity=.09+.25*shot.reveal;key.intensity=.3+2.25*shot.reveal;fill.intensity=.12+.25*shot.reveal;
    rim.intensity=1.25;warmEdge.intensity=.28+.12*shot.warmth;
    key.position.set(-4+shot.warmth*2,5,5);warmEdge.position.set(-4,1,2);
    edgeLines.forEach(line=>line.geometry.setDrawRange(0,Math.floor((N+1)*shot.edgeReveal)));
    group.rotation.set(shot.pitch,shot.yaw,shot.roll);group.position.set(0,.2,0);
    group.scale.setScalar(fitPaperScale(positions,group.rotation,camera.aspect,shot.scale,.2));
   }
   else if(mode==='hero'){group.rotation.set(.92+.38*opening,-.44-.68*opening,-.52-.24*opening);group.position.set(0,.12-.15*opening,0);group.scale.setScalar(1.06-.1*opening)}
   else if(mode==='explore'){group.rotation.set(.88+displayedView.explore.y,-.35+displayedView.explore.x+currentFlip,-.35);group.position.set(0,.05,0);group.scale.setScalar(.95)}
   else{group.rotation.set(.68+displayedView.mobius.y,-.45+move+displayedView.mobius.x,-.52);group.position.set(0,.05,0);group.scale.setScalar(fitPaperScale(positions,group.rotation,camera.aspect,1.14,.05))}
   placeDots();
   if(mode!=='finale')dotA.visible=dotR.visible=mode!=='hero'||openingProgress>.72;
   const moving=Math.abs(currentFlip-flipAngle)>.001;
   const animating=!reduced&&!tracePaused&&mode!=='finale';
   const idleDots=animating&&(mode==='hero'||mode==='explore');
   // Two walkers keep the still cover alive; drawing is capped near 30 fps.
   const drawNow=needsDraw||moving||morphing||viewMoving||(animating&&mode==='mobius')||(idleDots&&now-lastPaint>=32);
   if(drawNow){
    renderer.render(scene,camera);needsDraw=false;lastPaint=now;
    if(!active.classList.contains('ready')){active.classList.add('ready');active.dispatchEvent(new Event('paper-ready'))}
   }
   if(animating&&(idleDots||moving||morphing||viewMoving||mode==='mobius'))frame=requestAnimationFrame(render);
   // Keep a single draw loop while the film clock is running. Requesting a new
   // frame only from GSAP updates would miss alternate display frames.
   if(mode==='finale'&&document.querySelector<HTMLElement>('#connection-film')?.dataset.state==='playing')frame=requestAnimationFrame(render);
 }
 function requestFrame(){if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(render)}
 slots.forEach(el=>{
   el.addEventListener('pointerdown',e=>{if(!['explore','mobius'].includes(el.dataset.stage!)||(e.target as HTMLElement).closest('button'))return;dragging=true;dragDistance=0;lastX=e.clientX;lastY=e.clientY;el.setPointerCapture(e.pointerId)});
   el.addEventListener('pointermove',e=>{if(!dragging)return;dragDistance+=Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY);nudgeView((e.clientX-lastX)*.0055,(e.clientY-lastY)*.003);lastX=e.clientX;lastY=e.clientY;needsDraw=true;requestFrame()});
   el.addEventListener('keydown',e=>{
     const keys:Record<string,[number,number]>={ArrowLeft:[-.18,0],ArrowRight:[.18,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};
     if(keys[e.key]){e.preventDefault();nudgeView(...keys[e.key])}
     if(e.key==='Home'&&rotations[mode]){e.preventDefault();rotations[mode]={x:0,y:0};stamp();needsDraw=true;requestFrame()}
   });
   el.addEventListener('pointerup',e=>{
    if(dragging&&dragDistance<7&&mode==='mobius'){
     const rect=el.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
     const hit=raycaster.intersectObjects([paper,back])[0];
     if(hit?.uv){const reverse=hit.object===back;el.dispatchEvent(new CustomEvent('paper-touch',{detail:{phase:(hit.uv.x+(reverse?1:0))/2,offset:(hit.uv.y-.5)*1.42*(reverse?-1:1)}}))}
    }dragging=false;
   });el.addEventListener('pointercancel',()=>{dragging=false});
 });
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{needsDraw=true;requestFrame()}};document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active?.classList.remove('ready');cancelAnimationFrame(frame);frame=0});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{updateGeometry();active?.classList.add('ready');requestFrame()});
 updateGeometry();
 return {
   setFinale(seconds){const switching=(filmSeconds===null)!==(seconds===null),previousTwist=filmShot.twist;filmSeconds=seconds;if(seconds!==null)filmShot=finaleScore(seconds);if(switching)choose();if(mode==='finale'){geometryDirty ||= previousTwist!==filmShot.twist;needsDraw=true;requestFrame()}},
   setOpening(value){openingProgress=Math.max(0,Math.min(1,value));if(mode==='hero'){needsDraw=true;requestFrame()}},
   setReduced(value){reduced=value;if(value){twistProgress=twistTarget;if(lightProgress>=0)lightProgress=1}needsDraw=true;updateGeometry();requestFrame()},
   setTwist(value){if(twistTarget===value)return;twistTarget=value;if(value<1){pendingLight=undefined;lightProgress=-1;trail.visible=false}if(reduced||mode!=='mobius'){twistProgress=value;geometryDirty=true}if(mode==='mobius'){needsDraw=true;stamp();requestFrame()}},
   flip(){flipAngle+=Math.PI;needsDraw=true;requestFrame()},
   nudgeView,
   resetView(){if(rotations[mode])rotations[mode]={x:0,y:0};pendingLight=undefined;if(mode==='mobius'&&lightProgress>=0){lightProgress=-1;trail.visible=false;fadeText(lightStatus,'视角已复位。再放下一束光，重新出发。')}stamp();needsDraw=true;requestFrame()},
   setTracePaused(value){tracePaused=value;stamp();needsDraw=true;requestFrame()},
   sendLight(phase=0,offset=.28){pendingLight={phase,offset};needsDraw=true;requestFrame()},
   refresh(){choose();resize()},
   destroy(){cancelAnimationFrame(frame);io.disconnect();ro.disconnect();document.removeEventListener('visibilitychange',visibility);geometry.dispose();trailGeometry.dispose();trailMaterial.dispose();edgeLines.forEach(l=>{l.geometry.dispose();l.material.dispose()});filmRibbons.forEach(m=>{m.geometry.dispose();m.material.dispose()});seamLights.forEach(m=>{m.geometry.dispose();m.material.dispose()});seamGlows.forEach(m=>m.material.dispose());filmGlow.material.dispose();glowTexture.dispose();halo.geometry.dispose();halo.material.dispose();dotA.geometry.dispose();dotR.geometry.dispose();dotA.material.dispose();dotR.material.dispose();stitchGeometry.dispose();stitches.material.dispose();filmMaterials.forEach(m=>m.dispose());filmTextures.forEach(t=>t.dispose());mat.dispose();backMat.dispose();surfaces.forEach(s=>s.texture.dispose());renderer.dispose()}
 };
}
