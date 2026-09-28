'use server';
import {adminSaveError} from '@/lib/admin-errors';
import {requireAdmin} from '@/lib/admin-access';
import {saveManagedBlogPost} from '@/lib/blog.server';
import {revalidatePath} from 'next/cache';
export async function saveBlogPost(input:unknown,originalSlug:string|null){
 try {
 await requireAdmin();
 const post=await saveManagedBlogPost(input,originalSlug);
 for(const path of ['/blog',`/blog/${post.slug}`,'/admin/blog','/','/sitemap.xml'])revalidatePath(path);
 return {post};
 } catch (error) { return {error:adminSaveError(error)}; }
}
