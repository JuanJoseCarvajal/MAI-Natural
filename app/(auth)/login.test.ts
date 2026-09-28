import {beforeEach,expect,it,vi} from 'vitest';
vi.mock('@/lib/auth',()=>({signIn:vi.fn()}));
vi.mock('@/lib/db',()=>({db:{user:{findUnique:vi.fn()}},databaseTransaction:vi.fn()}));
vi.mock('@/lib/login-security',()=>({consumeLoginAttempt:vi.fn()}));
vi.mock('@/lib/email',()=>({sendTransactionalEmail:vi.fn()}));
import {signIn} from '@/lib/auth';
import {db} from '@/lib/db';
import {loginAction} from './actions';
beforeEach(()=>vi.clearAllMocks());
it('returns the admin destination after one successful authentication',async()=>{
 vi.mocked(db.user.findUnique).mockResolvedValue({email:'hola@mainatural.com',role:'admin'} as never);
 expect(await loginAction('hola@mainatural.com','ExamplePassword123!')).toMatchObject({success:true,destination:'/admin'});
 expect(signIn).toHaveBeenCalledTimes(1);
});
it('keeps customers in their account even if the email matches the admin account',async()=>{
 vi.mocked(db.user.findUnique).mockResolvedValue({email:'hola@mainatural.com',role:'user'} as never);
 expect(await loginAction('hola@mainatural.com','ExamplePassword123!')).toMatchObject({success:true,destination:'/account'});
});
it('does not report success after rejected credentials',async()=>{
 vi.mocked(signIn).mockRejectedValueOnce(new Error('Invalid credentials'));
 const result=await loginAction('hola@mainatural.com','ExamplePassword123!');expect(result.error).toBeTruthy();expect(result.success).toBeUndefined();
});
