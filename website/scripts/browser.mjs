import {chromium} from 'playwright';

/** Local runs use the installed Edge; CI sets PAPER_BROWSER=chromium and installs
 *  the bundled browser instead. */
export async function launchBrowser(){
 const requested=process.env.PAPER_BROWSER||'msedge';
 if(requested!=='msedge')return chromium.launch({headless:true});
 try{return await chromium.launch({channel:'msedge',headless:true})}
 catch(error){
  console.warn('[qa] Edge not available, falling back to bundled Chromium:',String(error.message).split('\n')[0]);
  return chromium.launch({headless:true});
 }
}
