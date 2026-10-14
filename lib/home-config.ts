import {z} from 'zod';
import {adminProductSchema} from './validators/admin';
import type {Product} from './products';
const text=(max:number)=>z.string().trim().min(1).max(max).refine(v=>!/[<>\u0000]/.test(v),'Usa texto sin HTML.');
const link=z.string().max(300).refine(v=>/^\/(?!\/)[a-zA-Z0-9/?#=&_%.-]*$/.test(v)&&!v.includes('..'),'Usa un enlace interno, por ejemplo /products.');
export const homePanelSchema=z.object({id:text(80),title:text(160),description:text(400),image:adminProductSchema.shape.image,alt:text(250),href:link,action:text(80),enabled:z.boolean()}).strict();
const panels=z.array(homePanelSchema).min(1).max(12).refine(rows=>rows.some(row=>row.enabled),'Deja al menos un elemento visible.').refine(rows=>new Set(rows.map(row=>row.id)).size===rows.length,'Los elementos deben tener identificadores únicos.');
export const homeConfigSchema=z.object({revision:z.number().int().min(0),categories:panels});
export type HomeConfig=z.infer<typeof homeConfigSchema>;
export type HomePanel=z.infer<typeof homePanelSchema>;
const categories:HomePanel[]=[
 {id:'facial',title:'Vuelve a tu piel.',description:'Un momento de calma. Un ritual que se siente.',image:'/products/media/facial/fa-lnd-70-1.png',alt:'Cuidado facial botánico MAI',href:'/products?category=facial',action:'Explorar cuidado facial',enabled:true},
 {id:'capilar',title:'Tu cabello, en su naturaleza.',description:'Descubre otra forma de vivir tu ritual capilar.',image:'/products/media/capilar/mnk-001-1.png',alt:'Cuidado capilar MAI',href:'/products?category=capilar',action:'Explorar cuidado capilar',enabled:true},
 {id:'corporal',title:'Habita tu bienestar.',description:'Pequeños gestos para cuidar todo tu cuerpo.',image:'/products/media/corporal/crema-corporal-1.png',alt:'Cuidado corporal MAI',href:'/products?category=corporal',action:'Explorar cuidado corporal',enabled:true},
];
export const defaultHomeConfig:HomeConfig={revision:0,categories:categories.map((p,i)=>({...p,title:['Para tu piel','Para tu cabello','Para todo tu cuerpo'][i]}))};
const categoryProductIds:Record<string,string>={facial:'fa-lnd-70',capilar:'mnk-001',corporal:'crema-corporal'};
export function getHomeCategories(config:HomeConfig,products:Product[]):HomePanel[]{
 return config.categories.map(panel=>{
  const original=categories.find(category=>category.id===panel.id);
  const product=products.find(product=>product.id===categoryProductIds[panel.id]&&product.active!==false);
  return original&&panel.image===original.image&&product?.image
   ? {...panel,image:product.image,alt:product.name} : panel;
 });
}
