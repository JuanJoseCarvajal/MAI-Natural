import {expect,it} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {imageTableSql} from './product-image-store';
it('initializes idempotently and preserves exact photo bytes with category isolation',async()=>{
 const db=new PGlite();
 try {
  await db.exec(imageTableSql);await db.exec(imageTableSql);
  const bytes=new Uint8Array([137,80,78,71,1,2,3]);
  await db.query('INSERT INTO mai_product_images (category,filename,content) VALUES ($1,$2,$3)',['facial','test.png',bytes]);
  const result=await db.query<{content:Uint8Array}>('SELECT content FROM mai_product_images WHERE category=$1 AND filename=$2',['facial','test.png']);
  expect(Array.from(result.rows[0].content)).toEqual(Array.from(bytes));
  expect((await db.query('SELECT content FROM mai_product_images WHERE category=$1 AND filename=$2',['capilar','test.png'])).rows).toHaveLength(0);
 }finally{await db.close();}
});
