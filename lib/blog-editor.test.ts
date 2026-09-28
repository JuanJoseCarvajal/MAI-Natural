import {beforeEach,afterAll,expect,it,vi} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
const state=vi.hoisted(()=>({client:null as any}));
vi.mock('./postgres-store',()=>({persistentDatabaseEnabled:()=>true,withPersistentDatabase:async(fn:any)=>fn(state.client)}));
vi.mock('./site-content',()=>({publicSiteContent:async()=>({})}));
import {saveManagedBlogPost,getManagedBlogPosts,blogTableSql} from './blog.server';
import {getEditableBlogPosts} from './blog-content';
import {blogEditorSchema,isVisiblePost,type BlogDraft} from './blog-editor';
const db=new PGlite();
beforeEach(async()=>{state.client=db;await db.exec(blogTableSql);await db.exec('ALTER TABLE mai_blog_posts ENABLE ROW LEVEL SECURITY');await db.exec('DELETE FROM mai_blog_posts');});
afterAll(async()=>{await db.close();});
const post:BlogDraft={slug:'test-article',title:'Un artículo de prueba',description:'Resumen',category:'Facial',heroImage:'/products/media/facial/fa-lnd-70-1.png',heroAlt:'Frasco de leche facial',keywords:[],sections:[{heading:'Un subtítulo',body:['Párrafo completo.']}],publishedAt:'2026-01-01T00:00:00.000Z',status:'draft',revision:0};
it('persists drafts privately and publishes complete articles',async()=>{
 const saved=await saveManagedBlogPost(post,null);expect(saved.revision).toBe(1);
 expect((await getManagedBlogPosts()).some(p=>p.slug===post.slug)).toBe(true);
 expect((await getEditableBlogPosts()).some(p=>p.slug===post.slug)).toBe(false);
 await saveManagedBlogPost({...saved,status:'published'},post.slug);
 expect((await getEditableBlogPosts()).find(p=>p.slug===post.slug)?.sections[0].body).toEqual(['Párrafo completo.']);
});
it('rejects stale revisions and duplicate addresses',async()=>{
 await saveManagedBlogPost(post,null);
 await expect(saveManagedBlogPost(post,null)).rejects.toThrow();
 await expect(saveManagedBlogPost(post,post.slug)).rejects.toThrow('Otra sesión');
});
it('keeps schedules hidden before their date and validates publication requirements',()=>{
 expect(isVisiblePost({...post,status:'scheduled',publishedAt:'2099-01-01T00:00:00Z'})).toBe(false);
 expect(blogEditorSchema.safeParse({...post,status:'published',heroAlt:''}).success).toBe(false);
 expect(blogEditorSchema.safeParse({...post,title:'<script>x</script>'}).success).toBe(false);
});
