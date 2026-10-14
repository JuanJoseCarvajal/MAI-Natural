import {expect,it} from 'vitest';
import {isAnhydrousProduct,anhydrousShopUrl} from './anhydrous';
import catalog from './products.catalog.json';
import type {Product} from './products';

it('selects the entire explicitly identified anhydrous collection for home and shop',()=>{
 expect((catalog as Product[]).map(p=>({...p,active:true})).filter(isAnhydrousProduct).map(p=>p.id)).toEqual(['shampoo-solido-fortaleza','shampoo-solido-ayurvedico','shampoo-solido-vital','acondicionador-solido-normal','acondicionador-solido-crespos','jabon-corporal-saponificado','desodorante-kids','desodorante-adulto']);
 expect(anhydrousShopUrl).toBe('/products?collection=cosmetica-anhidra');
});
it('recognizes accented editorial labels, excludes inactive and unconfirmed products',()=>{
 const product=catalog[0] as Product;
 expect(isAnhydrousProduct({...product,name:'Cosmética ANHÍDRIDA',description:''})).toBe(true);
 expect(isAnhydrousProduct({...product,name:'Anhidro',active:false})).toBe(false);
 expect(isAnhydrousProduct({...product,name:'Shampoo sólido',description:'Formato en barra'})).toBe(true);
});
