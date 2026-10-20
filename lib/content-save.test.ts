import {expect,it} from 'vitest';
import {validateContentChanges,resolvePublishedContent} from './site-content';
import {contentBlocks} from './content-layout';
it('saves a combined headline without leaving its old ending on the page',()=>{
 const block=contentBlocks.find(block=>block.keys.length>1)!;
 const changes=block.keys.map((key,i)=>({key,value:i===0?'Un nuevo título completo':'',revision:0}));
 expect(validateContentChanges(changes)).toEqual(changes);
 expect(()=>validateContentChanges([{key:block.keys[0],value:'',revision:0}])).toThrow();
});
it('accepts one atomic save spanning more than 200 editable texts',()=>{
 const changes=contentBlocks.slice(0,201).map(block=>({key:block.keys[0],value:'Texto actualizado',revision:0}));
 expect(changes).toHaveLength(201);
 expect(validateContentChanges(changes)).toEqual(changes);
});

it('uses the same consultation title default in the CMS and on the public page',()=>{
 const values=resolvePublishedContent([]);
 expect(['01597aee56c795617aab','00a9168e710447e54c00','3fab4effa62d66c1f44e'].map(key=>values[key]).join(' ')).toBe('¿Y si esta vez empiezas por escucharte?');
});
it('published overrides win over defaults, including cleared title continuations',()=>{
 const values=resolvePublishedContent([{key:'01597aee56c795617aab',value:'Título publicado'},{key:'00a9168e710447e54c00',value:''},{key:'3fab4effa62d66c1f44e',value:''},{key:'unknown-key',value:'No publicar'}]);
 expect(values['01597aee56c795617aab']).toBe('Título publicado');
 expect(values['3fab4effa62d66c1f44e']).toBe('');
 expect(values['unknown-key']).toBeUndefined();
});
