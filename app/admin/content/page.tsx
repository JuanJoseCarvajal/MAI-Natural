import { requireAdmin } from '@/lib/admin-access';
import { readSiteContent, siteTextCatalog } from '@/lib/site-content';
import ContentEditor from '@/components/admin/ContentEditor';
export const dynamic = 'force-dynamic';
export default async function ContentPage() {
  await requireAdmin();
  const saved = await readSiteContent();
  const entries = Object.entries(siteTextCatalog).map(([key,field]) => {
    const row = saved.find(item => item.key === key);
    return {key,...field,value:row?.value ?? field.text,revision:row?.revision ?? 0};
  });
  return <section><ContentEditor entries={entries}/></section>;
}
