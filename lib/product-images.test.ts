import {expect,it} from 'vitest';
import {GET} from '../app/products/media/[category]/[filename]/route';
it('serves a consolidated catalog photo with its image content type',async()=>{
 const response=await GET(new Request('http://localhost'),{params:Promise.resolve({category:'facial',filename:'fa-lam-120-1-1.png'})});
 expect(response.status).toBe(200);expect(response.headers.get('content-type')).toBe('image/png');
 const bytes=new Uint8Array(await response.arrayBuffer());expect(Array.from(bytes.slice(0,4))).toEqual([137,80,78,71]);
});
it('refuses traversal and unsupported files',async()=>{
 for(const filename of ['../products.catalog.json','file.svg','../../.env.local']){
  expect((await GET(new Request('http://localhost'),{params:Promise.resolve({category:'facial',filename})})).status).toBe(404);
 }
});
