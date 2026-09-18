import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.MAI_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3000';
try {
 for(const path of ['/subscriptions','/club-mai/checkout?plan=ritual','/club-mai/bienvenida?plan=embajadora']) {
  await page.goto(base+path);
  await page.getByRole('heading',{level:1,name:/Hay preguntas/}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/subscriptions');
  assert.equal(await page.locator('input').count(),0);
  assert.equal(await page.getByText('Inscripciones aún no abiertas',{exact:true}).count(),1);
 }
 for(const payload of ['{}','{',JSON.stringify({plan:'ritual',name:'Prueba local',email:'test@example.com',billing:'monthly'}),JSON.stringify({plan:42,name:['test'],email:true})]) {
  const response=await page.request.post(base+'/api/club-mai/join',{data:payload,headers:{'Content-Type':'application/json'}});
  assert.equal(response.status(),403);
  assert.equal((await response.json()).ok,false);
 }
 await page.screenshot({path:'/tmp/mai-circle-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/mai-circle-mobile.png',fullPage:true});
 await page.getByRole('link',{name:'Empezar por mi encuentro ↗',exact:true}).click();
 await page.waitForURL('**/services#tu-encuentro');
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.locator('dialog[open]').waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS legacy redirects, disabled API including malformed payloads, no enrollment fields, mobile overflow, services CTA and modal, no runtime errors.');
}finally{await browser.close();}
