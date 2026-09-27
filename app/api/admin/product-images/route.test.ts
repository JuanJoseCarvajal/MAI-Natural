import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
vi.mock('@/lib/admin-access',()=>({requireAdmin:vi.fn()}));
vi.mock('node:fs/promises',()=>({mkdir:vi.fn(),writeFile:vi.fn()}));
import {requireAdmin} from '@/lib/admin-access';
import {writeFile} from 'node:fs/promises';
import {POST} from './route';
const png=new Uint8Array([137,80,78,71,13,10,26,10,...Array(16).fill(0)]);
function request(bytes:Uint8Array=png,category='facial',origin='https://mainatural.com') {
 const form=new FormData(); form.append('category',category); form.append('file',new Blob([bytes as BlobPart]),'photo.png');
 return new NextRequest('https://mainatural.com/api/admin/product-images',{method:'POST',headers:{origin},body:form});
}
beforeEach(()=>{vi.resetAllMocks();vi.mocked(requireAdmin).mockResolvedValue({id:'admin',email:'hola@mainatural.com'});});
describe('product image uploads',()=>{
 it('requires authentication and same origin',async()=>{
   expect((await POST(request(png,'facial','https://evil.test'))).status).toBe(403);
   vi.mocked(requireAdmin).mockRejectedValue(new Error('unauthorized'));
   expect((await POST(request())).status).toBe(401);expect(writeFile).not.toHaveBeenCalled();
 });
 it('rejects unsafe category and non-image content',async()=>{
   expect((await POST(request(png,'../outside'))).status).toBe(400);
   expect((await POST(request(new TextEncoder().encode('<svg onload="alert(1)">')))).status).toBe(400);
   expect(writeFile).not.toHaveBeenCalled();
 });
 it('stores uploads under their category with unique filenames',async()=>{
   const response=await POST(request());expect(response.status).toBe(201);
   expect((await response.json()).url).toMatch(/^\/products\/media\/facial\/[a-f0-9-]+\.png$/);
   expect(writeFile).toHaveBeenCalledOnce();
 });
 it('rejects oversized bodies before writing',async()=>{
   const req=request();req.headers.set('content-length',String(6*1024*1024));
   expect((await POST(req)).status).toBe(413);expect(writeFile).not.toHaveBeenCalled();
 });
});
