import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Indica la carpeta de fotos originales.');
const mappings = [["mnk-001","Shampoo Líquido","capilar",["Shampoo liquido 1.png"]],["acondicionador-leave-in","Acondicionador Leave In Botánico","capilar",["Acondicionador leave in botanico .png"]],["mascarilla-capilar","Mascarilla Capilar","capilar",["Mascarilla capilar 1.png","Mascarilla capilar 3.png"]],["shampoo-solido-fortaleza","Shampoo Sólido Fortaleza","capilar",["Shampoo solido fortaleza 1.png","shampoo solido fortaleza 2.png"]],["shampoo-solido-ayurvedico","Shampoo Sólido Ayurvédico","capilar",["Shampoo solido ayurvedico 1.png","Shampoo solido ayurvedico 2.png"]],["shampoo-solido-vital","Shampoo Sólido Vital","capilar",["Shampoo solido vital 1.png","shampoo solido vital 2.png"]],["acondicionador-solido-normal","Acondicionador Sólido Normal","capilar",["Acondicionador sólido normal 1.png","Acondicionador solido normal 2.png","Acondicionador solido normal 3.png"]],["acondicionador-solido-crespos","Acondicionador Sólido Crespos","capilar",["Acondicionador solido crespos 1.png","Acondicionador solido crespos 2.png","Acondicionador solido crespos 3.png"]],["tonico-capilar","Tónico Capilar","capilar",[]],["ca-hcc-500","Crema de Peinar Herbal Curl","capilar",["Crema de peinar 1.png","Crema de peinar 2.png"]],["espuma-lavanda-ortiga","Jabón Espumoso Facial Lavanda y Ortiga","facial",["Espuma facial Lavanda y Ortiga.png","Espuma facial Lavanda y Ortiga 2.png","Espuma facial Lavand y Ortiga 3.png"]],["fa-lnd-70","Leche Nutritiva Día","facial",["Leche nutritiva dia 1.png","Leche nutritiva dia 2.png"]],["fa-lnn-70","Leche Nutritiva Noche","facial",["Leche nutritiva noche 1.png","Leche nutritiva noche 2.png"]],["contorno-ojos","Contorno de Ojos","facial",["Contorno de ojos.png"]],["fa-lam-120-1","Agua de Rosas","facial",[]],["elixir-facial-capilar","Elixir Facial y Capilar","facial",["elixir facial y capilar 1.png"]],["balsamos-labiales","Bálsamos Labiales","facial",["Balsamos labiales 1.png","Balsamos labiales 2.png","Balsamos labiales 3.png","Balsamos labiales 4.png"]],["crema-corporal","Crema Corporal Naranja Coco Karité","corporal",["crema corporal 300ml 1.png","Crema corporal 300ml 2.png"]]];
const destination = path.resolve('public/products/autor');
await mkdir(destination, {recursive:true});
const available = await readdir(source);
for (const [id,,,files] of mappings) {
 for (const [index,file] of files.entries()) {
   const actual = available.find(name => name.normalize('NFC') === file.normalize('NFC'));
   if (!actual) throw new Error('Falta ' + file);
   await copyFile(path.join(source,actual), path.join(destination,id+'-'+(index+1)+'.png'));
 }
}
console.log('33 fotografías copiadas sin modificar los originales.');
