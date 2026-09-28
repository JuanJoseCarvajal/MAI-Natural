import {allBlogPosts} from './blog';
import {publicSiteContent} from './site-content';
import {persistentDatabaseEnabled,withPersistentDatabase} from './postgres-store';
import {blogEditorSchema,readingTime,type BlogDraft} from './blog-editor';
export const blogTableSql=`CREATE TABLE IF NOT EXISTS mai_blog_posts (slug text PRIMARY KEY, data jsonb NOT NULL, revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())`;
export async function getManagedBlogPosts():Promise<BlogDraft[]>{
 const values=await publicSiteContent();
 const defaults:BlogDraft[]=allBlogPosts.map(post=>{
  const text=(key:string,fallback:string)=>values[`blog:${post.slug}:${key}`]??fallback;
  return {slug:post.slug,heroImage:post.heroImage,keywords:post.keywords,relatedProductCategory:post.relatedProductCategory,promotion:post.promotion,title:text('title',post.title),description:text('description',post.description),category:text('category',post.category),heroAlt:post.title,publishedAt:new Date(post.publishedAt).toISOString(),status:Date.parse(post.publishedAt)>Date.now()?'scheduled':'published',revision:0,
   sections:post.sections.map((s,i)=>({heading:text(`section:${i}:heading`,s.heading),body:s.body.map((p,j)=>text(`section:${i}:body:${j}`,p))}))};
 });
 if(!persistentDatabaseEnabled())return defaults;
 const rows=await withPersistentDatabase(async client=>{
  const table=await client.query("SELECT to_regclass('mai_blog_posts') AS name");if(!table.rows[0]?.name)return [];
  return (await client.query('SELECT data,revision FROM mai_blog_posts')).rows;
 });
 const merged=new Map(defaults.map(post=>[post.slug,post]));
 for(const row of rows){const post=blogEditorSchema.parse({...row.data,revision:row.revision});merged.set(post.slug,post);}
 return [...merged.values()].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
export async function saveManagedBlogPost(input:unknown,originalSlug:string|null){
 const post=blogEditorSchema.parse(input);
 if(originalSlug&&originalSlug!==post.slug)throw new Error('La dirección de un artículo existente no se puede cambiar.');
 if(!originalSlug&&allBlogPosts.some(p=>p.slug===post.slug))throw new Error('Ya existe un artículo con esa dirección.');
 const revision=await withPersistentDatabase(async client=>{
  await client.query(blogTableSql);
  await client.query('ALTER TABLE mai_blog_posts ENABLE ROW LEVEL SECURITY');
  await client.query('REVOKE ALL ON mai_blog_posts FROM PUBLIC');
  const previous=(await client.query('SELECT revision FROM mai_blog_posts WHERE slug=$1 FOR UPDATE',[post.slug])).rows[0];
  if((!originalSlug&&previous)||(previous?.revision??0)!==post.revision)throw new Error('Otra sesión modificó este artículo o la dirección ya existe. Recarga antes de continuar.');
  const result=await client.query(`INSERT INTO mai_blog_posts (slug,data) VALUES ($1,$2::jsonb) ON CONFLICT (slug) DO UPDATE SET data=excluded.data,revision=mai_blog_posts.revision+1,updated_at=now() RETURNING revision`,[post.slug,JSON.stringify(post)]);
  return result.rows[0].revision as number;
 });
 return {...post,revision};
}
