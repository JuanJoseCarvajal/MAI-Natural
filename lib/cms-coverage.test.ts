import {expect,it} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
import catalog from './site-text-catalog.json';
import {contentBlocks} from './content-layout';

it('registers literal text bindings from published CMS sources and exposes them in the editor',()=>{
 const registered:Record<string,{source:string;text:string}>=catalog;
 const editable=new Set(contentBlocks.flatMap(block=>block.keys));
 for(const source of new Set(Object.values(registered).map(entry=>entry.source))){
  if(!source.endsWith('.tsx')||!existsSync(source))continue;
  const tree=ts.createSourceFile(source,readFileSync(source,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node:ts.Node){
   if(ts.isJsxElement(node)&&node.openingElement.tagName.getText(tree)==='SiteText'){
    const attr=node.openingElement.attributes.properties.find(prop=>ts.isJsxAttribute(prop)&&prop.name.getText(tree)==='id');
    if(attr&&ts.isJsxAttribute(attr)&&attr.initializer&&ts.isStringLiteral(attr.initializer)){
     const key=attr.initializer.text;expect(registered[key],`${source}: ${key}`).toBeDefined();expect(editable.has(key),`${source}: ${key} missing in CMS`).toBe(true);
    }
   }
   ts.forEachChild(node,visit);
  }visit(tree);
 }
});
