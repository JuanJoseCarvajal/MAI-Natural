import {expect,it} from 'vitest';
import {contentBlocks,contentContinuationKeys} from './content-layout';
import catalog from './site-text-catalog.json';
it('excludes individual product and blog editing and maps each field once',()=>{
 const keys=contentBlocks.flatMap(b=>b.keys);
 expect(new Set(keys).size).toBe(keys.length);
 for(const block of contentBlocks){expect(block.source).not.toMatch(/Diario \/|\/blog\/|products\/(ProductCard|\[id\])/);for(const key of block.keys)expect(catalog).toHaveProperty(key);}
});
it('combines the split home headline into a single editable title',()=>{
 const block=contentBlocks.find(b=>b.id==='66e6259e4b4ff8e6a16a');
 expect(block?.type).toBe('Título');expect(block?.keys).toHaveLength(2);
 expect(contentContinuationKeys.has('7d2ed90e853d00f1d759')).toBe(true);
});
