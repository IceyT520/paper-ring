export interface Parameters { alpha:number; beta:number; gamma:number; delta:number; D:number }
export type ModelMode = 'linear' | 'bounded';
export interface Sample { t:number; A:number; R:number }
export const INITIAL = { A:.65, R:.15 };
export const DEFAULT_PARAMETERS:Parameters={alpha:3,beta:1,gamma:3,delta:1,D:3};
export function validate(p:Parameters){
  if(Object.values(p).some(v=>!Number.isFinite(v)||v<=0)) throw new RangeError('All model parameters must be positive and finite.');
}
export function criticalDistance(p:Parameters){return p.alpha*p.gamma/(p.beta*p.delta)}
export function regime(p:Parameters):'critical'|'growth'|'decay'{
 const ratio=p.D/criticalDistance(p);
 return Math.abs(ratio-1)<1e-9?'critical':ratio<1?'growth':'decay';
}
export function derivative(A:number,R:number,p:Parameters,mode:ModelMode):[number,number]{
 return mode==='linear'?[p.alpha*R/p.D-p.beta*A,p.gamma*A-p.delta*R]:[p.alpha*R/p.D*(1-A)-p.beta*A,p.gamma*A*(1-R)-p.delta*R];
}
// Exact matrix exponential. Real eigenvalues; no synthetic oscillation or clipping.
export function linearAt(t:number,p:Parameters,initial=INITIAL):Sample{
 validate(p);
 const m=-(p.beta+p.delta)/2;
 const q=Math.sqrt(((p.delta-p.beta)/2)**2+p.alpha*p.gamma/p.D);
 const e1=Math.exp((m+q)*t),e2=Math.exp((m-q)*t);
 const c=(e1+e2)/2,s=(e1-e2)/(2*q);
 return {t,A:c*initial.A+s*((-p.beta-m)*initial.A+p.alpha/p.D*initial.R),R:c*initial.R+s*(p.gamma*initial.A+(-p.delta-m)*initial.R)};
}
export function rk4(A:number,R:number,dt:number,p:Parameters,mode:ModelMode):[number,number]{
 const a=derivative(A,R,p,mode),b=derivative(A+dt*a[0]/2,R+dt*a[1]/2,p,mode);
 const c=derivative(A+dt*b[0]/2,R+dt*b[1]/2,p,mode),d=derivative(A+dt*c[0],R+dt*c[1],p,mode);
 return [A+dt*(a[0]+2*b[0]+2*c[0]+d[0])/6,R+dt*(a[1]+2*b[1]+2*c[1]+d[1])/6];
}
export function boundedEquilibrium(p:Parameters){
 if(p.D>=criticalDistance(p))return{A:0,R:0};
 const A=(p.alpha*p.gamma-p.beta*p.delta*p.D)/(p.gamma*(p.alpha+p.beta*p.D));
 return{A,R:p.gamma*A/(p.delta+p.gamma*A)};
}
export function simulate(p:Parameters,mode:ModelMode,horizon=12):{samples:Sample[];truncated:boolean}{
 validate(p);
 const samples:Sample[]=[{t:0,...INITIAL}];
 const steps=Math.round(horizon*40);let A=INITIAL.A,R=INITIAL.R;
 for(let i=1;i<=steps;i++){
   const t=i/40;
   if(mode==='linear'){
     const point=linearAt(t,p);samples.push(point);
     if(Math.max(point.A,point.R)>10000)return{samples,truncated:true};
   }else{
     for(let k=0;k<6;k++) [A,R]=rk4(A,R,1/240,p,mode);
     samples.push({t,A,R});
   }
 }
 return{samples,truncated:false};
}
