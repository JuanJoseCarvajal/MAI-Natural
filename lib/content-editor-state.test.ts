import {expect,it} from 'vitest';
import {mergeContentEntries,type ContentEntry} from './content-editor-state';
const entry:ContentEntry={key:'heading',source:'home',text:'Original',value:'Original',revision:1};
it('loads changes from another session into clean fields',()=>{
 expect(mergeContentEntries([entry],[{...entry,value:'Desde otro navegador',revision:2}],new Set())[0].value).toBe('Desde otro navegador');
});
it('preserves draft baseline revisions so a refresh cannot silently bypass conflicts',()=>{
 expect(mergeContentEntries([entry],[{...entry,value:'Desde otro navegador',revision:2}],new Set(['heading']))[0]).toEqual(entry);
});

it('does not replace a confirmed save with an older refresh response',()=>{
 expect(mergeContentEntries([{...entry,revision:3,value:'Nueva publicación'}],[entry],new Set())[0].revision).toBe(3);
});
