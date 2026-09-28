import {beforeAll, afterAll, afterEach, expect, it, vi} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const runtime = vi.hoisted(() => ({engine:null as any, queue:Promise.resolve(), offline:false}));
vi.mock('server-only', () => ({}));
vi.mock('pg', () => ({Pool: class {
 on() {}
 async query(sql:string, args?:unknown[]) {if(runtime.offline) throw new Error('offline');return runtime.engine.query(sql,args);}
 async connect() {let release!:()=>void;const previous=runtime.queue;runtime.queue=new Promise<void>(resolve=>{release=resolve;});await previous;return {query:this.query.bind(this),release};}
}}));
import {createProduct, updateProduct, getAllProductsForAdmin, deleteProduct} from './products.server';
import {createDiscount, updateDiscount, getAllDiscountsForAdmin} from './discounts.server';
import {readCatalog} from './catalog-store';
let directory:string;
const product={id:'shared',name:'Producto compartido',image:'/products/a.png',images:['/products/a.png'],price:'$10.000',amountInCents:1000000,description:'Original',category:'facial' as const,benefits:[],rating:0,reviewsCount:0};
beforeAll(async()=>{
 vi.stubEnv('DATABASE_DRIVER','postgres');vi.stubEnv('DATABASE_URL','postgresql://fixture');
 directory=await mkdtemp(join(tmpdir(),'mai-catalogs-'));runtime.engine=new PGlite(directory);
 await runtime.engine.exec('CREATE TABLE mai_schema (version integer PRIMARY KEY); CREATE ROLE anon; CREATE ROLE authenticated;');
 await runtime.engine.exec(await readFile('migrations/003-shared-catalogs.sql','utf8'));
 await runtime.engine.query("INSERT INTO mai_catalogs (name,items) VALUES ('products','[]'),('discounts','[]')");
},30000);
afterEach(()=>{runtime.offline=false;});
afterAll(async()=>{vi.unstubAllEnvs();await runtime.engine.close();await rm(directory,{recursive:true,force:true});});
it('retains a saved product after a server/database restart and rejects a stale editor',async()=>{
 const created=await createProduct(product);
 const firstBrowser=(await getAllProductsForAdmin()).find(p=>p.id===created.id)!;
 const secondBrowser=structuredClone(firstBrowser);
 await updateProduct(created.id,{...firstBrowser,description:'Guardado desde otro navegador'});
 await runtime.engine.close();runtime.engine=new PGlite(directory);
 expect((await getAllProductsForAdmin()).find(p=>p.id===created.id)?.description).toBe('Guardado desde otro navegador');
 await expect(updateProduct(created.id,{...secondBrowser,description:'Obsoleto'})).rejects.toThrow('Otra sesión');
});
it('rejects deletion from a stale browser',async()=>{
 const stale=(await getAllProductsForAdmin()).find(p=>p.id==='shared')!;
 await updateProduct(stale.id,{...stale,description:'Edición posterior'});
 await expect(deleteProduct(stale.id,stale.revision)).rejects.toThrow('Otra sesión');
 expect((await getAllProductsForAdmin()).some(p=>p.id===stale.id)).toBe(true);
});
it('serializes concurrent writes to different products without losing either',async()=>{
 await Promise.all([createProduct({...product,id:'one'}),createProduct({...product,id:'two'})]);
 expect((await getAllProductsForAdmin()).map(p=>p.id)).toEqual(expect.arrayContaining(['shared','one','two']));
});
it('persists discounts and prevents stale changes',async()=>{
 const input={code:'MAI10',label:'Prueba',active:true,kind:'percentage' as const,percentage:10,scope:'all' as const};
 const saved=await createDiscount(input);
 await updateDiscount(saved.id,{...input,revision:saved.revision,percentage:15});
 expect((await getAllDiscountsForAdmin())[0].percentage).toBe(15);
 await expect(updateDiscount(saved.id,{...input,revision:saved.revision})).rejects.toThrow('Otra sesión');
});
it('never reads or writes the local catalog after a database failure',async()=>{
 runtime.offline=true;
 await expect(getAllProductsForAdmin()).rejects.toThrow('offline');
 await expect(createProduct({...product,id:'offline'})).rejects.toThrow('offline');
});
it('keeps an empty catalog empty instead of resurrecting bundled products',async()=>{
 for(const p of await getAllProductsForAdmin())await deleteProduct(p.id,p.revision);
 expect(await readCatalog('products')).toEqual([]);
});
it('denies direct catalog access to public application roles',async()=>{
 for(const role of ['anon','authenticated']){
  await runtime.engine.exec(`SET ROLE ${role}`);
  try {await expect(runtime.engine.query('SELECT * FROM mai_catalogs')).rejects.toThrow('permission denied');}
  finally {await runtime.engine.exec('RESET ROLE');}
 }
});
