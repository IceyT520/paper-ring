const smooth=(a:number,b:number,t:number)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q)};
/** One clock drives the lens, the actual strip, lighting and typography. */
export function finaleScore(seconds:number){
 const t=Math.max(0,Math.min(22,seconds));
 const unfold=smooth(1.8,4.5,t),turn=smooth(4.5,9.5,t),join=smooth(9.5,12,t),settle=smooth(12,16,t);
 return{
  twist:.2*unfold+.6*turn+.2*join,
  pitch:.98-.38*turn+.13*settle,
  yaw:-.8+.92*turn-.42*settle,
  roll:-.62+.18*turn-.08*settle,
  scale:1.7-.3*unfold-.15*turn-.05*settle,
  reveal:smooth(0,2.8,t),
  edgeReveal:smooth(.2,3.2,t),
  joinMarks:smooth(12,13,t)*(1-smooth(16,18,t)),
  warmth:smooth(9.5,13.5,t),
  pulse:smooth(11.8,15.5,t),
  pulseOpacity:smooth(11.8,12.6,t)*(1-smooth(12.8,16,t)),
  journey:smooth(12.5,20,t),
  finale:smooth(18.6,20.5,t),
  chapter:t<3.4?0:t<7?1:t<11.8?2:t<18.6?3:4,
 };
}
