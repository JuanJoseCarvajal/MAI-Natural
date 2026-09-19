import { it, expect } from 'vitest';
import { POST } from './route';
it('retires manual transfer confirmation without accepting a request', async () => {
 const response = await POST();
 expect(response.status).toBe(410);
 expect((await response.json()).error).toContain('Wompi');
});
