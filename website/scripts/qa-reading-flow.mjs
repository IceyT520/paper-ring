import assert from 'node:assert/strict';
import {launchBrowser,settleOpening} from './browser.mjs';
import {devUrlNoGate,offlineUrlNoGate} from './paths.mjs';

const url=process.argv.includes('--offline')?offlineUrlNoGate:devUrlNoGate;
const browser=await launchBrowser();
let failures=0;
try{
 for(const check of ['navigation','coupling']){
  const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
  try{
   await page.goto(url+'#chapter-07',{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);await settleOpening(page);
   if(check==='navigation'){
    // Contextual links must share the header without covering its other controls.
    const navigation=page.locator('.header-distance-nav');
    assert.equal(await navigation.count(),1,'subsection navigation is available in the original header');
    for(const section of [4,2,6]){
     await page.locator(`#distance-${section}`).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-160,behavior:'instant'}));
     await page.waitForTimeout(200);
     assert(await navigation.isVisible());
     assert.equal(await navigation.locator('[aria-current="location"]').count(),1,'one current subsection is marked while reading');
     assert.equal(await navigation.locator('[aria-current="location"]').getAttribute('href'),`#distance-${section}`);
     const nav=await navigation.boundingBox(),header=await page.locator('.site-header').boundingBox();
     assert(nav.y>=header.y&&nav.y+nav.height<=header.y+header.height,'subsection navigation shares the existing header');
    }
    await navigation.locator('a[href="#distance-3"]').focus();await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const header=await page.locator('.site-header').boundingBox(),section=await page.locator('#distance-3').boundingBox();
    assert(section.y>=header.y+header.height,'navigation does not cover the selected section');
    await page.locator('#reader-toggle').click();await page.waitForSelector('body.reader-mode');
    assert(!await navigation.isVisible(),'exhibition subsection links are hidden in full-text mode');
    await page.locator('#reader-toggle').click();await page.waitForSelector('body:not(.reader-mode)');
    await page.waitForTimeout(200);
    assert.equal(await navigation.locator('[aria-current="location"]').getAttribute('href'),'#distance-3');
    for(const width of [1366,1101]){
     await page.setViewportSize({width,height:960});await page.waitForTimeout(250);
     const nav=await navigation.boundingBox(),brand=await page.locator('.site-header .brand').boundingBox(),actions=await page.locator('.header-actions').boundingBox();
     assert(nav.x>=brand.x+brand.width&&nav.x+nav.width<=actions.x,'subsection links do not overlap global controls');
    }
    await page.setViewportSize({width:1100,height:960});await page.waitForTimeout(250);
    assert(!await navigation.isVisible(),'narrow layouts keep their existing header');
    await page.setViewportSize({width:1440,height:960});
    await page.locator('#chapter-08').evaluate(el=>el.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(300);
    assert(!await navigation.isVisible(),'chapter-specific navigation leaves with its chapter');
    assert(await page.locator('.header-caption').isVisible(),'the original header caption returns');
   }else{
    // Explain the actual coefficient after changes, including after reset and model switches.
    await page.locator('#simulator').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#coupling-value').count(),1,'the distance coefficient has an observable explanation');
    const value=async()=>{
     await page.waitForTimeout(450);
     return Number(await page.locator('#coupling-value').textContent());
    };
    assert.equal(await value(),.33);
    await page.locator('[data-preset="near"]').click();assert.equal(await value(),.74);
    await page.locator('[data-preset="far"]').click();assert.equal(await value(),.26);
    await page.locator('.advanced summary').click();
    await page.locator('[data-param="alpha"]').fill('6');assert.equal(await value(),.51);
    await page.locator('[data-model="bounded"]').click();assert.equal(await value(),.51);
    assert.match(await page.locator('#coupling-description').textContent(),/1−A/);
    await page.locator('#sim-reset').click();assert.equal(await value(),.33);
    await page.locator('[data-model="linear"]').click();await page.waitForTimeout(450);
    assert(!/1−A/.test(await page.locator('#coupling-description').textContent()));
   }
   console.log(`PASS reading flow: ${check}`);
  }catch(error){failures++;console.error(`FAIL reading flow: ${check}: ${error.message}`)}
  finally{await page.close()}
 }
}finally{await browser.close()}
if(failures)process.exitCode=1;
