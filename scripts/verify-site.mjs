import { createRequire } from 'node:module';
import { readdir, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const { chromium }=require(process.env.MAI_PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3000';const results=[];
async function routes(dir='app') {const out=[];for(const e of await readdir(dir,{withFileTypes:true})) {if(e.isDirectory())out.push(...await routes(dir+'/'+e.name));else if(e.name==='page.tsx')out.push(dir.replace(/^app/,'').replace(/\/\([^/]+\)/g,'')||'/');}return out;}
try {
 const catalog=JSON.parse(await readFile('lib/products.catalog.json','utf8'));
 const campaigns=JSON.parse(await readFile('lib/editorial-campaigns.json','utf8'));
 const publicPaths=['/','/products','/routines','/services','/subscriptions','/blog','/terms'];
 const paths=(await routes()).filter(p=>!p.includes('['));
 paths.push(...catalog.filter(p=>p.active!==false&&p.amountInCents>0).map(p=>'/products/'+p.id));
 const sitemap=await (await page.request.get(base+'/sitemap.xml')).text();
 const blogPaths=[...sitemap.matchAll(/<loc>https:\/\/mainatural.com(\/blog\/[^<]+)<\/loc>/g)].map(m=>m[1]);paths.push(...blogPaths);
 for(const path of [...new Set(paths)]) {
  const response=await page.goto(base+path);assert.equal(response.status(),200,path);
  const final=new URL(page.url()).pathname;
  const h1=await page.locator('h1').count();assert.equal(h1,1,path+' H1');
  assert.equal(await page.locator('main').count(),1,path+' landmark');
  assert.equal(response.headers()['x-content-type-options'],'nosniff');
  const canonical=await page.evaluate(()=>document.querySelector('link[rel=canonical]')?.getAttribute('href')||null);
  const robots=await page.evaluate(()=>document.querySelector('meta[name=robots]')?.getAttribute('content')||null);
  if(['/login','/register','/forgot-password','/reset-password'].includes(final)||final.startsWith('/checkout')) assert.match(robots||'',/noindex/,path);
  if(publicPaths.includes(final)||final.startsWith('/products/')||final.startsWith('/blog/')) assert.equal(new URL(canonical).href,new URL('https://mainatural.com'+final).href,path+' canonical');
  if(path.startsWith('/admin')||path.startsWith('/account')||path.startsWith('/dashboard'))assert.equal(final,'/login',path+' access');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path+' mobile overflow');
  await page.setViewportSize({width:1440,height:1000});
  console.log("Checked",path);
  results.push({path,final,status:response.status(),h1,canonical,robots});
 }
 const future=campaigns.find(p=>new Date(p.publishedAt)>new Date());
 assert.equal((await page.request.get(base+'/blog/'+future.slug)).status(),404);
 assert.equal((await page.request.get(base+'/products/does-not-exist')).status(),404);
 for(const endpoint of ['/api/appointments','/api/appointments?email=other@example.com'])assert.equal((await page.request.get(base+endpoint)).status(),401);
 assert.equal((await page.request.post(base+'/api/webhooks/calendly',{data:{event:'invitee.created'}})).status(),503);
 assert.equal((await page.request.post(base+'/api/club-mai/join',{data:{}})).status(),403);
 assert.deepEqual(errors,[]);
 await writeFile('/tmp/mai-route-audit.json',JSON.stringify(results,null,2));
 console.log(`PASS ${results.length} routes: status, H1, main, canonical/noindex, private redirects, mobile width, security headers; negative API and future-content checks.`);
} finally {await browser.close();}
