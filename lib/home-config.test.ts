import {afterAll,beforeEach,expect,it,vi} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
const state=vi.hoisted(()=>({client:null as any}));
vi.mock('./postgres-store',()=>({persistentDatabaseEnabled:()=>true,withPersistentDatabase:async(fn:any)=>fn(state.client)}));
import {defaultHomeConfig,homeConfigSchema,getAnhydrousProducts,getHomeBlogSlides,getHomeCategories} from './home-config';
import {getHomeConfig,saveHomeConfig,homeTableSql} from './home-config.server';
import catalog from './products.catalog.json';
import type {Product} from './products';
const db=new PGlite();
beforeEach(async()=>{state.client=db;await db.exec(homeTableSql);await db.exec('DELETE FROM mai_home_config');});
afterAll(async()=>{await db.close();});
it('provides a banner for each category and saves reordered hidden panels and product associations',async()=>{
 expect((await getHomeConfig()).heroes.map(p=>p.id)).toEqual(['facial','capilar','corporal','kits']);
 const config=structuredClone(defaultHomeConfig);config.heroes.reverse();config.heroes[1].enabled=false;config.categories[0].image='/products/custom.png';config.includeBlogSlides=false;config.anhydrous.productIds=['desodorante-kids'];
 const saved=await saveHomeConfig(config);
 expect(saved.revision).toBe(1);expect(await getHomeConfig()).toEqual(saved);
 await expect(saveHomeConfig(config)).rejects.toThrow('Otra sesión');
});
it('rejects unsafe images and links and an empty visible hero',()=>{
 const config=structuredClone(defaultHomeConfig);config.heroes[0].href='javascript:alert(1)';expect(homeConfigSchema.safeParse(config).success).toBe(false);
 config.heroes[0].href='//example.com';expect(homeConfigSchema.safeParse(config).success).toBe(false);
 config.heroes[0].href='/products';config.heroes[0].image='https://example.com/image.png';expect(homeConfigSchema.safeParse(config).success).toBe(false);
 expect(homeConfigSchema.safeParse({...defaultHomeConfig,heroes:defaultHomeConfig.heroes.map(p=>({...p,enabled:false}))}).success).toBe(false);
});
it('includes all described anhydrous products, excludes inactive products, and respects explicit empty selections',()=>{
 const products=(catalog as Product[]).map(p=>({...p,active:true}));
 expect(getAnhydrousProducts(products,null).map(p=>p.id)).toEqual(['acondicionador-solido-normal','acondicionador-solido-crespos','desodorante-kids','desodorante-adulto']);
 expect(getAnhydrousProducts(products,[])).toEqual([]);
 expect(getAnhydrousProducts(products.map(p=>({...p,active:false})),['desodorante-kids'])).toEqual([]);
 expect(getAnhydrousProducts(products,['desodorante-adulto','desodorante-kids']).map(p=>p.id)).toEqual(['desodorante-adulto','desodorante-kids']);
});

it('uses article content and excludes hidden and future blog slides',()=>{
 const post={slug:'real-article',title:'Artículo real',description:'Resumen real',heroImage:'/products/article.png',publishedAt:'2020-01-01',category:'Capilar',readTime:'3 min',keywords:[],sections:[]};
 const slides=getHomeBlogSlides([post,{...post,slug:'hidden',showOnHome:false},{...post,slug:'future',publishedAt:'2099-01-01'}]);
 expect(slides).toHaveLength(1);
 expect(slides[0]).toMatchObject({title:post.title,description:post.description,image:post.heroImage,href:'/blog/real-article'});
});
it('uses the current shampoo cover while preserving custom category images',()=>{
 const products=(catalog as Product[]).map(p=>p.id==='mnk-001'?{...p,image:'/products/latest.png'}:p);
 expect(getHomeCategories(defaultHomeConfig,products).find(p=>p.id==='capilar')?.image).toBe('/products/latest.png');
 const config=structuredClone(defaultHomeConfig);config.categories[1].image='/products/custom.png';
 expect(getHomeCategories(config,products)[1].image).toBe('/products/custom.png');
});
