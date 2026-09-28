const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const root = process.cwd();
  const esbuildDirectory = (await fs.readdir(path.join(root, "node_modules/.pnpm"))).find(name => name.startsWith("esbuild@"));
  const { build } = require(path.join(root, "node_modules/.pnpm", esbuildDirectory, "node_modules/esbuild"));
  const result = await build({
    stdin: { contents: `
      import React from "react";
      import {createRoot} from "react-dom/client";
      import Manager from "./components/admin/AdminProductsManager";
      import Gallery from "./components/features/products/ProductGallery";
      const photo="/products/media/corporal/crema-corporal-1.png";
      const second="/products/media/corporal/crema-corporal-2.png";
      const product={id:"fixture",name:"Producto de prueba",image:photo,images:[photo],price:"$35.000",amountInCents:3500000,description:"Inicial",category:"corporal",benefits:[],rating:0,reviewsCount:0,active:true};
      createRoot(document.getElementById("root")).render(<><Manager initialProducts={[product,{...product,id:"second",name:"Segundo producto"}]} /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:600}}><section id="single"><Gallery image={photo} name="Una foto" /></section><section id="multiple"><Gallery image={photo} images={[photo,second]} name="Varias fotos" /></section></div></>);
    `, resolveDir: root, loader: "tsx" },
    bundle: true, write: false, outdir: "/tmp/mai-overlay-bundle", jsx: "automatic",
    plugins: [{
      name: "local-fixture",
      setup(build) {
        build.onResolve({ filter: /^next\/image$/ }, () => ({ path: "image", namespace: "fixture" }));
        build.onResolve({ filter: /^@\/app\/admin\/actions$/ }, () => ({ path: "actions", namespace: "fixture" }));
        build.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({
          contents: args.path === "image" ? `import React from "react"; export default function Image({fill,sizes,priority,...props}) {return React.createElement("img",{...props,style:fill?{position:"absolute",inset:0,width:"100%",height:"100%"}:undefined});}` :
          `const save=async product=>{if(window.__fail){return {error:"Error de prueba"};} window.__saved=product;return {product:{...product,id:product.id||"new-product"}}};export const createAdminProduct=save;export const updateAdminProduct=(_,p)=>save(p);export const deleteAdminProduct=async()=>({success:true});`,
          loader: "js", resolveDir: root,
        }));
      },
    }],
  });
  const javascript = result.outputFiles.find(file => file.path.endsWith(".js")).text;
  const css = result.outputFiles.find(file => file.path.endsWith(".css")).text;
  const server = http.createServer(async (req, res) => {
    if (req.url === "/bundle.js") { res.setHeader("Content-Type", "text/javascript"); return res.end(javascript); }
    if (req.url === "/bundle.css") { res.setHeader("Content-Type", "text/css"); return res.end(css); }
    if (req.url.startsWith("/products/") && !req.url.includes("..")) {
      try { res.setHeader("Content-Type", "image/png"); return res.end(await fs.readFile(path.join(root, req.url.startsWith('/products/media/') ? 'assets/product-images' : 'public', req.url.replace('/products/media/', '')))); } catch { res.statusCode=404;return res.end(); }
    }
    res.setHeader("Content-Type", "text/html");
    res.end('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/bundle.css"><style>*{box-sizing:border-box}body{font-family:Arial;margin:24px}h1,h2,p{margin:0 0 8px}button,input{font:inherit}</style><div id="root"></div><script src="/bundle.js"></script></html>');
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    const errors=[];page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:" + server.address().port);
    await page.getByRole("heading", {name:"Gestión de productos"}).waitFor();
    assert.equal(await page.getByRole("dialog").count(), 0);
    const cards=page.locator("article");
    const a=await cards.nth(0).boundingBox(), b=await cards.nth(1).boundingBox();
    assert.equal(a.y,b.y); assert.ok(b.x>a.x);
    await page.getByRole("button",{name:"Crear producto",exact:true}).click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(),0);
    assert.equal(await page.getByRole("button",{name:"Crear producto",exact:true}).evaluate(el=>el===document.activeElement),true);
    await page.getByRole("button",{name:"Editar Producto de prueba",exact:true}).click();
    const dialog=page.getByRole("dialog");
    await dialog.getByLabel("Descripción",{exact:true}).fill("Descripción editada");
    let attempts=0;
    await page.route('**/api/admin/product-images',async route=>{
      attempts++;
      await route.fulfill({status:attempts===1?503:201,contentType:'application/json',body:JSON.stringify(attempts===1?{error:'Error temporal de carga'}:{url:'/products/media/corporal/crema-corporal-2.png'})});
    });
    await dialog.getByLabel('Agregar fotos desde este computador',{exact:true}).setInputFiles(path.join(root,'assets/product-images/corporal/crema-corporal-2.png'));
    await dialog.getByText('Error temporal de carga',{exact:true}).waitFor();
    await dialog.getByRole('button',{name:'Reintentar crema-corporal-2.png',exact:true}).click();
    await dialog.getByText('Subida. Pulsa Guardar producto para publicarla.',{exact:true}).waitFor();
    assert.equal(attempts,2);
    assert.equal(await dialog.getByLabel('Imagen 2',{exact:true}).inputValue(),'/products/media/corporal/crema-corporal-2.png');
    await dialog.getByLabel("Valoración",{exact:true}).fill("4.2");
    await page.evaluate(()=>window.__fail=true);
    await dialog.getByRole("button",{name:"Guardar producto",exact:true}).click();
    await dialog.getByRole("alert").getByText("Error de prueba").waitFor();
    assert.equal(await dialog.getByLabel("Descripción",{exact:true}).inputValue(),"Descripción editada");
    await page.evaluate(()=>window.__fail=false);
    await dialog.getByRole("button",{name:"Guardar producto",exact:true}).click();
    await page.getByText("Producto guardado y disponible en el sitio.",{exact:true}).waitFor();
    const saved=await page.evaluate(()=>window.__saved);
    assert.equal(saved.images.length,2); assert.equal(saved.rating,4.2); assert.equal(saved.description,"Descripción editada");
    const single=await page.locator("#single button").first().boundingBox(), multiple=await page.locator("#multiple button").first().boundingBox();
    assert.equal(single.height,multiple.height);
    const arrow=await page.getByRole("button",{name:"Foto siguiente de Varias fotos",exact:true}).boundingBox();
    assert.ok(arrow.y>=multiple.y && arrow.y+arrow.height<=multiple.y+multiple.height);
    await page.getByRole("button",{name:"Foto siguiente de Varias fotos",exact:true}).click();
    assert.match(await page.locator("#multiple img").first().getAttribute("src"),/2.png$/);
    await page.screenshot({path:"/tmp/mai-admin-products-desktop.png",fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.getByRole("button",{name:"Editar Producto de prueba",exact:true}).click();
    await dialog.waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:"/tmp/mai-admin-products-mobile.png"});
    assert.deepEqual(errors,[]);
    console.log("PASS: two-column cards, toolbar modal, Escape/focus restore, gallery addition and save/error state, equal image sizes, overlaid controls, mobile without overflow. Actions mocked; persistence tested separately.");
  } finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
