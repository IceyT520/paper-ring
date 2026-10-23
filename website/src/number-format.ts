const decimalFormats=[0,1,2].map(digits=>new Intl.NumberFormat('en-US',{
 minimumFractionDigits:digits,maximumFractionDigits:digits,useGrouping:true,
}));

/** Familiar decimal notation, with enough precision for the initial intensities. */
export function formatModelNumber(value:number):string{
 if(!Number.isFinite(value))return '—';
 const magnitude=Math.abs(value);
 return decimalFormats[magnitude>=10?0:magnitude>=1?1:2].format(value);
}
