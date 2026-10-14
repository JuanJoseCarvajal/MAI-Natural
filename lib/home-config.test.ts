import {afterAll,beforeEach,expect,it,vi} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
const state=vi.hoisted(()=>({client:null as any}));
vi.mock('./postgres-store',()=>({persistentDatabaseEnabled:()=>true,withPersistentDatabase:async(fn:any)=>fn(state.client)}));
import {defaultHomeConfig,homeConfigSchema,getHomeCategories} from './home-config';
import {getHomeConfig,saveHomeConfig,homeTableSql} from './home-config.server';
import catalog from './products.catalog.json';
import type {Product} from './products';
const db=new PGlite();
beforeEach(async()=>{state.client=db;await db.exec(homeTableSql);await db.exec('DELETE FROM mai_home_config');});
afterAll(async()=>{await db.close();});
it('persists category images and rejects stale updates',async()=>{
 const config=structuredClone(defaultHomeConfig);config.categories[0].image='/products/custom.png';
 const saved=await saveHomeConfig(config);expect(await getHomeConfig()).toEqual(saved);
 await expect(saveHomeConfig(config)).rejects.toThrow('Otra sesión');
});
it('rejects invalid category image URLs',()=>{
 const config=structuredClone(defaultHomeConfig);config.categories[0].image='https://example.com/image.png';
 expect(homeConfigSchema.safeParse(config).success).toBe(false);
});
it('uses current catalog covers for all three categories and preserves custom images',()=>{
 const ids=['fa-lnd-70','mnk-001','crema-corporal'];
 const products=(catalog as Product[]).map(p=>ids.includes(p.id)?{...p,image:`/products/updated-${p.id}.png`}:p);
 expect(getHomeCategories(defaultHomeConfig,products).map(p=>p.image)).toEqual(ids.map(id=>`/products/updated-${id}.png`));
 const config=structuredClone(defaultHomeConfig);config.categories[1].image='/products/custom.png';
 expect(getHomeCategories(config,products)[1].image).toBe('/products/updated-mnk-001.png');
 config.categories[1].imageProductId=null;
 expect(getHomeCategories(config,products)[1].image).toBe('/products/custom.png');
 expect(getHomeCategories(defaultHomeConfig,[])).toEqual(defaultHomeConfig.categories);
 expect(getHomeCategories(defaultHomeConfig,products.map(p=>({...p,active:false})))).toEqual(defaultHomeConfig.categories);
});
