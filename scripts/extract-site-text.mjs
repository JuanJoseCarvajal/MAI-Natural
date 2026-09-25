// One-time mechanical JSX migration. Re-running preserves existing field identifiers.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const catalogPath = 'lib/site-text-catalog.json';
const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : {};
function files(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
for (const file of [...files('app'), ...files('components')].filter(p => p.endsWith('.tsx') && !p.startsWith('app/admin/') && !p.startsWith('components/admin/') && !p.includes('SiteText') && !p.endsWith('layout.tsx'))) {
  let source = fs.readFileSync(file,'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  function visit(node) {
    if (ts.isJsxElement(node) && ['SiteText', 'script', 'style'].includes(node.openingElement.tagName.getText(ast))) return;
    if (ts.isJsxText(node) && /[A-Za-zÀ-ÿ]/.test(node.text)) {
      // JSX's own whitespace normalization, including multiline indentation.
      const lines = node.text.replace(/\t/g,' ').split(/\r\n|\n|\r/);
      const last = lines.reduce((a,l,i) => /[^ ]/.test(l) ? i : a, 0);
      let text = '';
      lines.forEach((line,i) => { if(i!==0) line=line.replace(/^ +/,''); if(i!==lines.length-1) line=line.replace(/ +$/,''); if(line) text+=line+(i!==last?' ':''); });
      // Preserve entities using the compiler's JSX decoding.
      const compiled = ts.transpileModule(`const x=<p>${node.text}</p>`, {compilerOptions:{jsx:ts.JsxEmit.React}}).outputText;
      const match = compiled.match(/createElement\("p", null, ("(?:[^"\\]|\\.)*")\)/);
      if(match) text=JSON.parse(match[1]);
      const id = crypto.createHash('sha256').update(file+'\0'+text).digest('hex').slice(0,20);
      catalog[id] = { source:file, text };
      edits.push({start:node.pos,end:node.end,value:`<SiteText id="${id}">{${JSON.stringify(text)}}</SiteText>`});
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  if (!edits.length) continue;
  for(const e of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,e.start)+e.value+source.slice(e.end);
  const importLine = '\nimport { SiteText } from "@/components/common/SiteText";\n';
  const directive = source.match(/^\s*(["'])use client\1;?/);
  source=directive ? source.slice(0,directive[0].length)+importLine+source.slice(directive[0].length) : importLine+source;
  fs.writeFileSync(file, source);
}
fs.writeFileSync(catalogPath, JSON.stringify(catalog,null,2)+'\n');
console.log(`${Object.keys(catalog).length} campos de texto registrados.`);
