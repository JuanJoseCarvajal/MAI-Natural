import fs from 'node:fs';
import ts from 'typescript';
const file='components/common/Navigation.tsx';
let source=fs.readFileSync(file,'utf8').replace('pathname.startsWith(link.href)', '(link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(link.href + "/"))');
source=source.replace('{link.label}', '<SiteText id={`navigation:${link.href}`}>{link.label}</SiteText>');
fs.writeFileSync(file,source);
const catalog=JSON.parse(fs.readFileSync('lib/site-text-catalog.json','utf8'));
for(const [href,label] of [['/','Inicio'],['/products','La tienda'],['/routines','Tu ritual'],['/services','Asesorías'],['/blog','Diario MAI'],['/subscriptions','Círculo MAI']]) catalog[`navigation:${href}`]={source:file,text:label};
const module={exports:{}};
const compiled=ts.transpileModule(fs.readFileSync('lib/blog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
new Function('require','exports',compiled)(()=>({default:JSON.parse(fs.readFileSync('lib/editorial-campaigns.json','utf8'))}),module.exports);
for(const post of module.exports.allBlogPosts){
  const add=(key,text)=>{catalog[`blog:${post.slug}:${key}`]={source:`Diario / ${post.slug}`,text};};
  for(const key of ['title','description','category','readTime'])add(key,post[key]);
  post.sections.forEach((section,i)=>{add(`section:${i}:heading`,section.heading);section.body.forEach((text,j)=>add(`section:${i}:body:${j}`,text));});
  if(post.promotion) for(const key of ['eyebrow','headline'])add(`promotion:${key}`,post.promotion[key]);
}
fs.writeFileSync('lib/site-text-catalog.json',JSON.stringify(catalog,null,2)+'\n');
