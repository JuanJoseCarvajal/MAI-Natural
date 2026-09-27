import { describe,it,expect } from 'vitest';
import {adminDiscountSchema,adminProductSchema} from './admin';
describe('administrative input validation',()=>{
  const product={image:'/products/test.png',name:'Producto',price:'$50.000',amountInCents:5000000,description:'Descripción',category:'facial'};
  it('rejects injected fields, external image URLs and invalid amounts',()=>{
    expect(adminProductSchema.safeParse(product).success).toBe(true);
    for(const patch of [{role:'admin'},{image:'javascript:alert(1)'},{image:'//evil.test/x'},{amountInCents:-1},{rating:9}])expect(adminProductSchema.safeParse({...product,...patch}).success).toBe(false);
  });
  it('rejects discounts outside of bounded values',()=>{
    const discount={code:'MAI10',label:'Oferta',active:true,kind:'percentage',percentage:10,scope:'all'};
    expect(adminDiscountSchema.safeParse(discount).success).toBe(true);
    expect(adminDiscountSchema.safeParse({...discount,percentage:101}).success).toBe(false);
  });
  it('validates galleries and unique purchasable variant identifiers',()=>{
    const image='/products/autor/test.png';
    expect(adminProductSchema.safeParse({...product,images:[image],variants:[{id:'menta',name:'Menta',image}]}).success).toBe(true);
    for(const patch of [
      {id:'invalid~variant'},
      {images:['https://evil.test/image.png']},
      {images:['/products/../private.txt']},
      {images:Array(21).fill(image)},
      {variants:[{id:'same',name:'A',image},{id:'same',name:'B',image}]},
      {variants:[{id:'a~b',name:'A',image}]}
    ]) expect(adminProductSchema.safeParse({...product,...patch}).success).toBe(false);
  });
});
