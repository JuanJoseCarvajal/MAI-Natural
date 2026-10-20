import {beforeEach,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({read:vi.fn()}));
vi.mock('./site-content',()=>({publicSiteContent:state.read}));
import {GET} from '@/app/api/site-content/route';
beforeEach(()=>vi.clearAllMocks());
it('serves the current publication without browser or intermediary caching',async()=>{
 state.read.mockResolvedValueOnce({title:'Primera publicación'}).mockResolvedValueOnce({title:'Nueva publicación'});
 const first=await GET();expect(first.headers.get('cache-control')).toContain('no-store');
 expect(await first.json()).toEqual({values:{title:'Primera publicación'}});
 expect(await (await GET()).json()).toEqual({values:{title:'Nueva publicación'}});
});
it('does not masquerade defaults as a successful read during database failure',async()=>{
 state.read.mockRejectedValue(new Error('offline'));
 const response=await GET();expect(response.status).toBe(503);expect(response.headers.get('cache-control')).toContain('no-store');
 expect((await response.json()).values).toBeUndefined();
});
