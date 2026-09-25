import { describe,it,expect } from 'vitest';
import {adminDiscountSchema,adminProductSchema} from './admin';
describe('administrative input validation',()=>{
  const product={image:'/products/test.png',name:'Producto',price:'$50.000',amountInCents:5000000,description:'Descripción',category:'facial'};
  it('rejects injected fields, external image URLs and invalid amounts',()=>{
    expect(adminProductSchema.safeParse(product).success).toBe(true);
    for(const patch of [{role:'admin'},{image:'javascript:alert(1)'},{image:'//evil.test/x'},{amountInCents:-1},{stock:1.5}])expect(adminProductSchema.safeParse({...product,...patch}).success).toBe(false);
  });
  it('rejects discounts outside of bounded values',()=>{
    const discount={code:'MAI10',label:'Oferta',active:true,kind:'percentage',percentage:10,scope:'all'};
    expect(adminDiscountSchema.safeParse(discount).success).toBe(true);
    expect(adminDiscountSchema.safeParse({...discount,percentage:101}).success).toBe(false);
  });
});
