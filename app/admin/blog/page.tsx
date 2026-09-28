import {requireAdmin} from '@/lib/admin-access';
import {getManagedBlogPosts} from '@/lib/blog.server';
import BlogEditor from '@/components/admin/BlogEditor';
export const dynamic='force-dynamic';
export default async function BlogAdminPage(){await requireAdmin();return <BlogEditor initialPosts={await getManagedBlogPosts()}/>;}
