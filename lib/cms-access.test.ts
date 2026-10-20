import {beforeEach,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({authorized:true,write:vi.fn(),read:vi.fn(),invalidate:vi.fn()}));
vi.mock('./admin-access',()=>({requireAdmin:async()=>{if(!state.authorized)throw new Error('No autorizado');return {id:'admin'};}}));
vi.mock('./site-content',()=>({siteTextCatalog:{title:{source:'home',text:'Original'}},writeSiteContent:state.write,readSiteContent:state.read}));
vi.mock('next/cache',()=>({revalidatePath:state.invalidate}));
import {saveSiteContent,loadSiteContent} from '@/app/admin/content/actions';
beforeEach(()=>{state.authorized=true;vi.clearAllMocks();state.read.mockResolvedValue([]);state.write.mockResolvedValue([{key:'title',value:'Nuevo',revision:1}]);});
it('requires an authorized admin for reading the editor and saving',async()=>{
 state.authorized=false;
 expect((await saveSiteContent([])).error).toBeTruthy();
 await expect(loadSiteContent()).rejects.toThrow('No autorizado');
 expect(state.read).not.toHaveBeenCalled();expect(state.write).not.toHaveBeenCalled();
});
it('returns confirmed revisions and invalidates published pages only after success',async()=>{
 expect((await saveSiteContent([{key:'title',value:'Nuevo',revision:0}])).saved?.[0].revision).toBe(1);
 expect(state.invalidate).toHaveBeenCalledWith('/','layout');
 state.invalidate.mockClear();state.write.mockRejectedValue(new Error('Otra sesión modificó estos textos.'));
 expect((await saveSiteContent([])).error).toContain('Otra sesión');expect(state.invalidate).not.toHaveBeenCalled();
});
