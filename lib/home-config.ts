import {z} from 'zod';
import {adminProductSchema} from './validators/admin';
import type {Product} from './products';
const text=(max:number)=>z.string().trim().min(1).max(max).refine(v=>!/[<>\u0000]/.test(v),'Usa texto sin HTML.');
const link=z.string().max(300).refine(v=>/^\/(?!\/)[a-zA-Z0-9/?#=&_%.-]*$/.test(v)&&!v.includes('..'),'Usa un enlace interno, por ejemplo /products.');
export const homePanelSchema=z.object({id:text(80),title:text(160),description:text(400),image:adminProductSchema.shape.image,alt:text(250),href:link,action:text(80),enabled:z.boolean()}).strict();
const panels=z.array(homePanelSchema).min(1).max(12).refine(rows=>rows.some(row=>row.enabled),'Deja al menos un elemento visible.').refine(rows=>new Set(rows.map(row=>row.id)).size===rows.length,'Los elementos deben tener identificadores únicos.');
export const homeConfigSchema=z.object({revision:z.number().int().min(0),heroes:panels,categories:panels,includeBlogSlides:z.boolean(),anhydrous:z.object({title:text(160),description:text(600),image:adminProductSchema.shape.image,alt:text(250),productIds:z.array(z.string().min(1).max(160)).max(100).refine(ids=>new Set(ids).size===ids.length,'No repitas productos asociados.').nullable()}).strict()}).strict();
export type HomeConfig=z.infer<typeof homeConfigSchema>;
export type HomePanel=z.infer<typeof homePanelSchema>;
const categories:HomePanel[]=[
 {id:'facial',title:'Vuelve a tu piel.',description:'Un momento de calma. Un ritual que se siente.',image:'/products/media/facial/fa-lnd-70-1.png',alt:'Cuidado facial botánico MAI',href:'/products?category=facial',action:'Explorar cuidado facial',enabled:true},
 {id:'capilar',title:'Tu cabello, en su naturaleza.',description:'Descubre otra forma de vivir tu ritual capilar.',image:'/products/media/capilar/mnk-001-1.png',alt:'Cuidado capilar MAI',href:'/products?category=capilar',action:'Explorar cuidado capilar',enabled:true},
 {id:'corporal',title:'Habita tu bienestar.',description:'Pequeños gestos para cuidar todo tu cuerpo.',image:'/products/media/corporal/crema-corporal-1.png',alt:'Cuidado corporal MAI',href:'/products?category=corporal',action:'Explorar cuidado corporal',enabled:true},
 {id:'kits',title:'Un ritual para compartir.',description:'Encuentra combinaciones de cuidado para ti o para regalar.',image:'/products/media/facial/espuma-lavanda-ortiga-1.png',alt:'Formulaciones botánicas para tu ritual MAI',href:'/products?category=kits',action:'Explorar kits',enabled:true},
];
export const defaultHomeConfig:HomeConfig={revision:0,heroes:categories,categories:categories.map((p,i)=>({...p,title:['Para tu piel','Para tu cabello','Para tu cuerpo','Para regalar'][i]})),includeBlogSlides:true,anhydrous:{title:'El agua la pones tú.',description:'Cosmética anhidra: fórmulas sin agua, texturas que sorprenden y una nueva manera de vivir tu cuidado. Descubre la colección y encuentra tu próximo esencial.',image:'/products/media/capilar/acondicionador-solido-crespos-2.png',alt:'Acondicionador sólido anhidro MAI',productIds:null}};
export function getAnhydrousProducts(products:Product[],ids:string[]|null){return ids===null?products.filter(p=>p.active!==false&&/anhidr/i.test(p.name+' '+p.description)):ids.flatMap(id=>products.filter(p=>p.id===id&&p.active!==false));}

// The hero always uses the article itself, so its cover, copy and destination agree.
export function getHomeBlogSlides(posts: import('./blog').BlogPost[]): HomePanel[] {
 return posts.filter(post=>post.showOnHome!==false && post.heroImage && Date.parse(post.publishedAt)<=Date.now()).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,4).map(post=>({
  id:`blog-${post.slug}`,title:post.title,description:post.description,image:post.heroImage,
  alt:('heroAlt' in post && typeof post.heroAlt==='string' ? post.heroAlt : post.title),
  href:`/blog/${post.slug}`,action:'Leer historia',enabled:true,
 }));
}
export function getHomeCategories(config:HomeConfig,products:Product[]):HomePanel[]{
 const shampoo=products.find(p=>p.id==='mnk-001'&&p.active!==false);
 return config.categories.map(panel=>panel.id==='capilar'&&panel.image==='/products/media/capilar/mnk-001-1.png'&&shampoo
  ? {...panel,image:shampoo.image,alt:shampoo.name} : panel);
}
