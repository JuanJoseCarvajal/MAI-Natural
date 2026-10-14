import {requireAdmin} from '@/lib/admin-access';
import {getManagedBlogPosts} from '@/lib/blog.server';
import {getAllProductsForAdmin} from '@/lib/products.server';
import BlogEditor from '@/components/admin/BlogEditor';
export const dynamic='force-dynamic';
export default async function BlogAdminPage(){await requireAdmin();const [posts,products]=await Promise.all([getManagedBlogPosts(),getAllProductsForAdmin()]);return <BlogEditor initialPosts={posts} products={products.map(({id,name,active,category})=>({id,name,active,category}))}/>;}
