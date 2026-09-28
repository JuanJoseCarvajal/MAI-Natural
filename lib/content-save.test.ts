import {expect,it} from 'vitest';
import {validateContentChanges} from './site-content';
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
