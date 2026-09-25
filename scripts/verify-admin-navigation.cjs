const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto('http://127.0.0.1:3100/products');
    const home=page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Inicio',exact:true});
    assert.equal(await home.getAttribute('href'),'/');
    assert.equal(await home.getAttribute('aria-current'),null);
    await home.click();await page.waitForURL('http://127.0.0.1:3100/');
    assert.equal(await home.getAttribute('aria-current'),'page');
    await page.screenshot({path:'/tmp/mai-home-desktop.png'});
    await page.setViewportSize({width:390,height:844});
    await page.goto('http://127.0.0.1:3100/products');
    await page.getByRole('button',{name:'Abrir menú',exact:true}).click();
    await home.click();await page.waitForURL('http://127.0.0.1:3100/');
    await page.screenshot({path:'/tmp/mai-home-mobile.png'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth),true);
    for(const path of ['/admin','/admin/content','/admin/users','/admin/orders']){
      await page.goto('http://127.0.0.1:3100'+path);
      assert.equal(new URL(page.url()).pathname,'/login');
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: Inicio desktop/móvil, enlace activo correcto, sin desbordamiento móvil, 4 rutas admin protegidas, sin errores de consola.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
