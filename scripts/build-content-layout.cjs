const fs=require('node:fs');
const ts=require('typescript');
const catalog=require('../lib/site-text-catalog.json');
const output=[];
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const source of [...new Set(Object.values(catalog).map(e=>e.source))]){
 // Article bodies are managed in the blog editor, not in the shared text editor.
 if(source.startsWith('Diario /')||!fs.existsSync(source))continue;
 const code=fs.readFileSync(source,'utf8');
 const tree=ts.createSourceFile(source,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const used=new Set(),blocks=new Map(),patterns=[],scopes=[];
 const tag=node=>ts.isJsxElement(node)?node.openingElement.tagName.getText(tree):'';
 const literal=node=>node&&ts.isStringLiteralLike(node)?node.text:null;
 function safeContainer(n){
  if(ts.isJsxElement(n)&&tag(n)==='SiteText')return true;
  if(ts.isJsxElement(n)&&!/^(h[1-6]|p|em|strong|span)$/.test(tag(n)))return false;
  if(ts.isJsxSelfClosingElement(n))return n.tagName.getText(tree)==='br';
  if(ts.isJsxExpression(n))return false;
  if(ts.isJsxText(n)&&n.text.trim())return false;
  return !ts.isJsxElement(n)||n.children.every(safeContainer);
 }
 function words(node){let values=[];function collect(n){if(tag(n)==='SiteText'){const attr=n.openingElement.attributes.properties.find(p=>p.name?.getText(tree)==='id');const key=literal(attr?.initializer);if(catalog[key])values.push(catalog[key].text);return;}if(ts.isJsxText(n)&&n.text.trim())values.push(n.text.trim());ts.forEachChild(n,collect);}collect(node);return values.join(' ').replace(/\s+/g,' ').trim();}
 function sectionName(node){
  let ancestor=node.parent;
  while(ancestor){
   if(['section','header','footer','nav','aside'].includes(tag(ancestor))){
    let heading;function search(n){if(heading)return;if(/^h[1-6]$/.test(tag(n))){heading=n;return;}ts.forEachChild(n,search);}search(ancestor);
    if(heading&&words(heading))return words(heading).slice(0,110);
    if(tag(ancestor)==='nav')return 'Navegación';
   }
   ancestor=ancestor.parent;
  }
  if(source.includes('AnhydrousSection'))return 'Cosmética anhidra · banner y carrusel';
  if(source.includes('EditorialHero'))return 'Banner principal · carrusel del blog';
  if(source.includes('ProductGallery'))return 'Galería de imágenes · zoom';
  if(source.includes('ProductPurchase'))return 'Compra · opciones y disponibilidad';
  if(source.includes('ProductCard'))return 'Tarjetas de producto';
  if(source.includes('BlogMedia'))return 'Artículos · galería de imágenes';
  return 'Presentación y controles';
 }
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.getText(tree)==='editorialText'){const key=literal(node.arguments[0]);if(key&&catalog[key]&&!used.has(key)){used.add(key);output.push({id:key,source,keys:[key],type:'Otros textos',section:'Campos de formulario · ayudas',order:output.length,label:catalog[key].text});}}
  if(ts.isCallExpression(node)&&node.expression.getText(tree)==='useEditorialData'){const scope=literal(node.arguments[0]);if(scope)scopes.push(scope+':');}
  if(tag(node)==='SiteText'){
   const attr=node.openingElement.attributes.properties.find(p=>p.name?.getText(tree)==='id');let init=attr?.initializer;
   if(init&&ts.isJsxExpression(init))init=init.expression;
   if(init&&ts.isTemplateExpression(init)){patterns.push(new RegExp('^'+escape(init.head.text)+init.templateSpans.map(span=>'.+'+escape(span.literal.text)).join('')+'$'));}
   const key=literal(init);
   if(key&&catalog[key]&&catalog[key].source===source&&!used.has(key)){
    let parent=node.parent;while(parent&&!/^(h[1-6]|p|label|button|a|Link|summary|li)$/.test(tag(parent)))parent=parent.parent;
    const block=parent&&safeContainer(parent)?parent:node;
    if(!blocks.has(block))blocks.set(block,{keys:[],parent:parent??node});blocks.get(block).keys.push(key);used.add(key);
   }
  }
  ts.forEachChild(node,visit);
 }visit(tree);
 for(const [node,{keys,parent}] of blocks){
  const kind=tag(parent);const type=kind==='h1'?'Título':/^h[2-6]$/.test(kind)?'Subtítulo':/^(button|a|Link|summary)$/.test(kind)?'Botón o enlace':'Párrafo';
  output.push({id:keys[0],source,keys,type,section:sectionName(node),order:output.length,label:type==='Título'?'Título principal':type==='Subtítulo'?'Encabezado':type==='Párrafo'?'Texto':'Botón o enlace'});
 }
 for(const [key,e] of Object.entries(catalog).filter(([,entry])=>entry.source===source)){
  if(used.has(key)||(!patterns.some(pattern=>pattern.test(key))&&!scopes.some(scope=>key.startsWith(scope))))continue;
  const type=/:title$|:heading$|:headline$/.test(key)?'Subtítulo':/:body:|:description$|:text$|:note$/.test(key)?'Párrafo':'Otros textos';
  const section=key.startsWith('home:collection:')?'Categorías · ¿Por dónde quieres empezar?':key.startsWith('home:faq:')?'Preguntas frecuentes':key.startsWith('shop:filter:')?'Tienda · filtros de categorías':key.startsWith('navigation:')?'Menú principal':key.startsWith('rituals:')?'Rutinas · perfiles de cuidado':key.startsWith('consultation:')?'Asesoría · pasos y opciones':'Contenido de la sección';
  output.push({id:key,source,keys:[key],type,section,order:output.length,label:e.text.replace(/\s+/g,' ').slice(0,90)});
 }
}
fs.writeFileSync('lib/content-layout.json',JSON.stringify(output,null,2)+'\n');
console.log(`Prepared ${output.length} active contextual text blocks`);
