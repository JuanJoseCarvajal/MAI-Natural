import {z} from 'zod';
import {adminProductSchema} from './validators/admin';
const plain=(max:number)=>z.string().max(max).refine(value=>!/[<>\u0000]/.test(value),'Usa texto sin HTML.');
export const blogEditorSchema=z.object({
 slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
 title:plain(180).refine(value=>value.trim().length>=2,'Escribe un título de al menos dos caracteres.'),description:plain(500),category:plain(80),
 heroImage:z.union([z.literal(''),adminProductSchema.shape.image]),heroAlt:plain(250),
 publishedAt:z.string().datetime({offset:true}),status:z.enum(['draft','published','scheduled']),
 keywords:z.array(plain(80)).max(20),
 sections:z.array(z.object({heading:plain(250),body:z.array(plain(12000)).max(50),media:z.array(z.object({url:adminProductSchema.shape.image,alt:plain(250)}).strict()).max(20).optional(),layout:z.enum(['stack','carousel','grid']).optional()}).strict()).max(40),
 relatedProductCategory:z.enum(['facial','capilar','corporal','kits']).optional(),
 promotion:z.object({eyebrow:plain(160),headline:plain(250),productIds:z.array(z.string().max(160)).max(30)}).optional(),
 revision:z.number().int().min(0),
}).strict().superRefine((post,ctx)=>{
 if(post.status!=='draft'){
  if(post.sections.some(section=>section.media?.some(image=>!image.alt.trim())))ctx.addIssue({code:'custom',message:'Describe todas las imágenes de las secciones antes de publicar.'});
  if(!post.description.trim()||!post.category.trim()||!post.heroImage||!post.heroAlt.trim()||!post.sections.length||post.sections.some(s=>!s.heading.trim()||!s.body.some(p=>p.trim())))ctx.addIssue({code:'custom',message:'Para publicar completa resumen, categoría, portada, texto alternativo y al menos una sección con subtítulo y párrafo.'});
 }
});
export type BlogDraft=z.infer<typeof blogEditorSchema>;
export function readingTime(sections:BlogDraft['sections']){return `${Math.max(1,Math.ceil(sections.flatMap(s=>[s.heading,...s.body]).join(' ').trim().split(/\s+/).length/200))} min`;}
export function isVisiblePost(post:{status:string;publishedAt:string},now=new Date()){return post.status!=='draft'&&Date.parse(post.publishedAt)<=now.getTime();}
