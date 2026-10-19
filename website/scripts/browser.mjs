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

/** The opening locks scrolling and clicks on its first frames; tests that drive
 *  the exhibition directly skip it, waiting for the control if it is still coming. */
export async function settleOpening(page){
 const skip=page.locator('#skip-opening');
 try{await skip.waitFor({state:'visible',timeout:3000});await skip.click()}catch{/* no opening this run */}
 await page.waitForTimeout(150);
}
