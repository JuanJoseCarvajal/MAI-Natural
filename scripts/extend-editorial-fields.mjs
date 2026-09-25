import fs from 'node:fs';
import ts from 'typescript';
const catalog=JSON.parse(fs.readFileSync('lib/site-text-catalog.json','utf8'));
for(const [file,scope,q,a] of [
  ['app/(public)/page.tsx','home','q','a'],
  ['components/features/services/ConsultationExperience.tsx','services','question','answer'],
  ['app/(public)/subscriptions/page.tsx','subscriptions','question','answer'],
]) {
  let source=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node) {
    if(ts.isArrayLiteralExpression(node) && node.elements.length && node.elements.every(e=>ts.isArrayLiteralExpression(e)&&e.elements.length===2&&ts.isStringLiteral(e.elements[0]))){
      node.elements.forEach((pair,i)=>pair.elements.forEach((s,j)=>{if(ts.isStringLiteral(s))catalog[`${scope}:faq:${i}:${j?'answer':'question'}`]={source:file,text:s.text};}));
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  source=source.replace(`.map(([${q},${a}]) =>`,`.map(([${q},${a}], faqIndex) =>`);
  source=source.replace(`<summary>{${q}}`,`<summary><SiteText id={\`${scope}:faq:\${faqIndex}:question\`}>{${q}}</SiteText>`);
  source=source.replace(`<p>{${a}}</p>`,`<p><SiteText id={\`${scope}:faq:\${faqIndex}:answer\`}>{${a}}</SiteText></p>`);
  if(scope==='home'){
    function collection(node){if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='collections'&&ts.isArrayLiteralExpression(node.initializer)){node.initializer.elements.forEach(item=>{const props=Object.fromEntries(item.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.getText(ast),p.initializer.text]));for(const key of ['title','note'])catalog[`home:collection:${props.key}:${key}`]={source:file,text:props[key]};});}ts.forEachChild(node,collection);}
    collection(ast);
    source=source.replace('{c.title}</h3>','<SiteText id={`home:collection:${c.key}:title`}>{c.title}</SiteText></h3>').replace('{c.note}</p>','<SiteText id={`home:collection:${c.key}:note`}>{c.note}</SiteText></p>');
  }
  fs.writeFileSync(file,source);
}
fs.writeFileSync('lib/site-text-catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log(Object.keys(catalog).length+' campos editoriales');
