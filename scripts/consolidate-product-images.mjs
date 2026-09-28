// Mechanical migration: move catalog images by category and update exact references.
import fs from 'node:fs';
import path from 'node:path';
const products=JSON.parse(fs.readFileSync('lib/products.catalog.json','utf8'));
const mapping=fs.existsSync('lib/product-image-redirects.json') ? JSON.parse(fs.readFileSync('lib/product-image-redirects.json','utf8')) : {};
for(const product of products){
  for(const image of [product.image,...(product.images||[]),...(product.variants||[]).map(v=>v.image)]){
    if(!image.startsWith('/products/autor/') || image.endsWith('.svg')) continue;
    if(mapping[image]) continue;
    const name=path.basename(image), target=path.join('assets/product-images',product.category,name);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    if(fs.existsSync('public'+image)) fs.renameSync('public'+image,target);
    mapping[image]=`/products/media/${product.category}/${name}`;
  }
}
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(/\.(tsx?|json|mjs|cjs|md)$/.test(p)&&p!=='scripts/consolidate-product-images.mjs'){const old=fs.readFileSync(p,'utf8');let value=old;for(const [from,to] of Object.entries(mapping))value=value.replaceAll(from,to);if(old!==value)fs.writeFileSync(p,value);}}}
for(const dir of ['app','components','lib','scripts'])walk(dir);
fs.writeFileSync('lib/product-image-redirects.json',JSON.stringify(mapping,null,2)+'\n');
console.log(`Consolidated ${Object.keys(mapping).length} images.`);
