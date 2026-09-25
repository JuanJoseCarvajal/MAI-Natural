import fs from 'node:fs';
import ts from 'typescript';
const catalog=JSON.parse(fs.readFileSync('lib/site-text-catalog.json','utf8'));
function load(file){const exports={};new Function('exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exports);return exports;}
function register(value,key,source){if(typeof value==='string'){catalog[key]={source,text:value};return;}if(Array.isArray(value)){value.forEach((item,i)=>register(item,`${key}:${i}`,source));return;}if(value&&typeof value==='object')for(const [name,item]of Object.entries(value)){if(['id','kitId','productIds'].includes(name))continue;register(item,`${key}:${name}`,source);}}
const ritualFile='components/features/products/RoutineBuilderView.tsx';
register(load('lib/rituals.ts').baseRituals,'rituals',ritualFile);
let source=fs.readFileSync(ritualFile,'utf8');
source=source.replace('import { SiteText }','import { SiteText, useEditorialData }').replace('import { baseRituals,','import { baseRituals as originalRituals,');
source=source.replace(/(export default function RoutineBuilderView[^\n]+\{\n)/,'$1  const baseRituals = useEditorialData("rituals", originalRituals);\n');
fs.writeFileSync(ritualFile,source);
const consultationFile='components/features/services/ConsultationExperience.tsx';
source=fs.readFileSync(consultationFile,'utf8');
const ast=ts.createSourceFile(consultationFile,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function visit(node){if(ts.isVariableDeclaration(node)&&['stepNames','titles','descriptions'].includes(node.name.getText(ast))){register(node.initializer.elements.map(item=>item.text),`consultation:${node.name.getText(ast)}`,consultationFile);}ts.forEachChild(node,visit);}
visit(ast);
const data=load('lib/consultation.ts');
register(data.consultationTopics,'consultation:topics',consultationFile);register(data.consultationIntentions,'consultation:intentions',consultationFile);
source=source.replace('import { SiteText }','import { SiteText, useEditorialData }');
source=source.replace('consultationTopics,','consultationTopics as originalTopics,').replace('consultationIntentions,','consultationIntentions as originalIntentions,');
for(const name of ['stepNames','titles','descriptions'])source=source.replace(`const ${name} =`,`const original_${name} =`);
source=source.replace(/(export default function ConsultationExperience[^\n]+\{\n)/,'$1  const consultationTopics = useEditorialData("consultation:topics", originalTopics);\n  const consultationIntentions = useEditorialData("consultation:intentions", originalIntentions);\n  const stepNames = useEditorialData("consultation:stepNames", original_stepNames);\n  const titles = useEditorialData("consultation:titles", original_titles);\n  const descriptions = useEditorialData("consultation:descriptions", original_descriptions);\n');
fs.writeFileSync(consultationFile,source);
fs.writeFileSync('lib/site-text-catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log(Object.keys(catalog).length+' campos');
