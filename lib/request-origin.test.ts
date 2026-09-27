import {afterEach,expect,it,vi} from 'vitest';
import {isTrustedUploadOrigin} from './request-origin';
afterEach(()=>vi.unstubAllEnvs());
it('accepts public origins behind an internal Hostinger URL',()=>{
 vi.stubEnv('NODE_ENV','production');
 for(const origin of ['https://mainatural.com','https://www.mainatural.com']) expect(isTrustedUploadOrigin(origin,'http://127.0.0.1:3000/api/admin/product-images')).toBe(true);
});
it('rejects missing origins, lookalike domains and internal origins in production',()=>{
 vi.stubEnv('NODE_ENV','production');
 for(const origin of [null,'null','https://mainatural.com.evil.test','http://mainatural.com','http://localhost:3000']) expect(isTrustedUploadOrigin(origin,'http://localhost:3000')).toBe(false);
});
it('allows an explicitly configured HTTPS site and local development',()=>{
 vi.stubEnv('NEXT_PUBLIC_APP_URL','https://preview.example.com/path');
 expect(isTrustedUploadOrigin('https://preview.example.com','http://internal:3000')).toBe(true);
 vi.stubEnv('NODE_ENV','development');
 expect(isTrustedUploadOrigin('http://localhost:3000','http://localhost:3000/upload')).toBe(true);
 expect(isTrustedUploadOrigin('https://evil.test','https://evil.test/upload')).toBe(false);
});
