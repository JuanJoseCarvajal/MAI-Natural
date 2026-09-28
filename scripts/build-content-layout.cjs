const fs=require('node:fs');
const ts=require('typescript');
const catalog=require('../lib/site-text-catalog.json');
const excluded=s=>/Diario \/|\/blog\/|products\/(ProductCard|\[id\])/.test(s);
const output=[];
for(const source of [...new Set(Object.values(catalog).map(e=>e.source))]){
 if(excluded(source))continue;
 const entries=Object.entries(catalog).filter(([,e])=>e.source===source),used=new Set();
 if(fs.existsSync(source)){
  const tree=ts.createSourceFile(source,fs.readFileSync(source,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),blocks=new Map();
  function tag(node){return ts.isJsxElement(node)?node.openingElement.tagName.getText(tree):'';}
  function visit(node){
   if(ts.isJsxElement(node)&&tag(node)==='SiteText'){
    const attr=node.openingElement.attributes.properties.find(p=>p.name?.getText(tree)==='id');const key=attr?.initializer?.text;
    if(catalog[key]&&catalog[key].source===source&&!used.has(key)){
     let parent=node.parent;while(parent&&!/^(h[1-6]|p|label|button|a|Link|summary|li)$/.test(tag(parent)))parent=parent.parent;
     function safeContainer(n){
      if(ts.isJsxElement(n)&&tag(n)==='SiteText')return true;
      if(ts.isJsxElement(n)&&!/^(h[1-6]|p|em|strong|span)$/.test(tag(n)))return false;
      if(ts.isJsxSelfClosingElement(n))return n.tagName.getText(tree)==='br';
      if(ts.isJsxExpression(n))return false;
      if(ts.isJsxText(n)&&n.text.trim())return false;
      if(ts.isJsxElement(n))return n.children.every(safeContainer);
      return true;
     }
     const block=parent&&safeContainer(parent)?parent:node;
     if(!blocks.has(block))blocks.set(block,[]);blocks.get(block).push(key);used.add(key);
    }
   }
   ts.forEachChild(node,visit);
  }visit(tree);
  let section='Presentación';let index=0;
  for(const [node,keys] of blocks){
   const kind=tag(node),text=keys.map(k=>catalog[k].text).join(' ');
   const type=kind==='h1'?'Título':/^h[2-6]$/.test(kind)?'Subtítulo':/^(button|a|Link|summary)$/.test(kind)?'Botón o enlace':'Párrafo';
   if(type==='Título'||type==='Subtítulo')section=text.replace(/\s+/g,' ').slice(0,100);
   output.push({id:keys[0],source,keys,type,section,order:index++,label:type==='Título'?'Título principal':type==='Subtítulo'?'Encabezado de sección':type==='Párrafo'?'Texto de la sección':'Texto del control'});
  }
 }
 for(const [key,e] of entries){if(used.has(key))continue;const type=/:title$|:heading$|:headline$/.test(key)?'Subtítulo':/:body:|:description$|:text$/.test(key)?'Párrafo':'Otros textos';output.push({id:key,source,keys:[key],type,section:'Contenido complementario',order:output.length,label:type});}
}
fs.writeFileSync('lib/content-layout.json',JSON.stringify(output,null,2)+'\n');
console.log(`Prepared ${output.length} contextual text blocks`);
