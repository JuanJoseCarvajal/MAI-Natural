import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('./auth',()=>({auth:vi.fn()}));
vi.mock('./db',()=>({db:{user:{findUnique:vi.fn()}}}));
import { auth } from './auth';
import { db } from './db';
import { requireAdmin } from './admin-access';
import { isAdministrativeAccount } from './admin-policy';
afterEach(()=>{vi.resetAllMocks();vi.unstubAllEnvs();});
describe('fresh administrative authorization',()=>{
  it('never grants access by email alone or to a different admin email',()=>{
    expect(isAdministrativeAccount({email:'hola@mainatural.com',role:'user'})).toBe(false);
    expect(isAdministrativeAccount({email:'hello@mainatural.com',role:'admin'})).toBe(false);
    expect(isAdministrativeAccount({email:'HOLA@MAINATURAL.COM',role:'admin'})).toBe(true);
  });
  it('rejects anonymous and transient-storage access',async()=>{
    vi.stubEnv('DATABASE_DRIVER','memory');vi.mocked(auth).mockResolvedValue({user:{id:'1',email:'hola@mainatural.com',role:'admin'}} as never);
    await expect(requireAdmin()).rejects.toThrow('No autorizado');
    vi.stubEnv('DATABASE_DRIVER','postgres');vi.mocked(auth).mockResolvedValue(null as never);
    await expect(requireAdmin()).rejects.toThrow('No autorizado');
  });
  it('revokes stale sessions immediately and fails closed on database failure',async()=>{
    vi.stubEnv('DATABASE_DRIVER','postgres');vi.mocked(auth).mockResolvedValue({user:{id:'1',email:'hola@mainatural.com',role:'admin'}} as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({id:'1',email:'hola@mainatural.com',role:'user'} as never);
    await expect(requireAdmin()).rejects.toThrow('No autorizado');
    vi.mocked(db.user.findUnique).mockRejectedValue(new Error('offline'));
    await expect(requireAdmin()).rejects.toThrow('offline');
  });
  it('allows only the current designated administrator',async()=>{
    vi.stubEnv('DATABASE_DRIVER','postgres');const user={id:'1',email:'hola@mainatural.com',role:'admin'};
    vi.mocked(auth).mockResolvedValue({user} as never);vi.mocked(db.user.findUnique).mockResolvedValue(user as never);
    expect(await requireAdmin()).toEqual({id:'1',email:'hola@mainatural.com'});
  });
});
