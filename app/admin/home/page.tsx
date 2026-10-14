import {requireAdmin} from '@/lib/admin-access';
import {getHomeCategories} from '@/lib/home-config';
import {getHomeConfig} from '@/lib/home-config.server';
import {getAllProductsForAdmin} from '@/lib/products.server';
import HomeEditor from '@/components/admin/HomeEditor';
export const dynamic='force-dynamic';
export default async function HomeAdminPage(){await requireAdmin();const [config,products]=await Promise.all([getHomeConfig(),getAllProductsForAdmin()]);return <HomeEditor initial={{...config,categories:getHomeCategories(config,products)}} products={products.map(({id,name,active,description,image})=>({id,name,active,description,image}))}/>;}
