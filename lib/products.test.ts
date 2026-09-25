import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import catalog from "./products.catalog.json";
import { resolveProduct, type Product } from "./products";
const products = catalog as Product[];
describe("catálogo de autor", () => {
 it("matches the 18 screenshot prices and lip variants", () => {
  const expected = {"mnk-001":68000,"acondicionador-leave-in":59000,"mascarilla-capilar":76000,"shampoo-solido-fortaleza":39000,"shampoo-solido-ayurvedico":39000,"shampoo-solido-vital":39000,"acondicionador-solido-normal":42000,"acondicionador-solido-crespos":42000,"tonico-capilar":56000,"ca-hcc-500":58000,"espuma-lavanda-ortiga":68000,"fa-lnd-70":75000,"fa-lnn-70":79000,"contorno-ojos":86000,"fa-lam-120-1":59000,"elixir-facial-capilar":69000,"balsamos-labiales":15000,"crema-corporal":58000};
  for (const [id, pesos] of Object.entries(expected)) expect(products.find(p=>p.id===id)?.amountInCents).toBe(pesos*100);
  for (const variant of products.find(p=>p.id==="balsamos-labiales")!.variants!) expect(resolveProduct(products,"balsamos-labiales~"+variant.id)?.amountInCents).toBe(1500000);
 });
 it("has 22 products, 34 photographs and three lip variants", () => {
  expect(products).toHaveLength(22);
  expect(products.flatMap(p=>p.images || [])).toHaveLength(34);
  expect(products.filter(p=>p.name.includes("Leave In"))).toHaveLength(1);
  expect(products.find(p=>p.id==="balsamos-labiales")?.variants).toHaveLength(3);
  for(const p of products) for(const image of [p.image,...p.images||[]]) expect(existsSync(path.join(process.cwd(),"public",image))).toBe(true);
 });
 it("includes the four approved additions and keeps soap sold out", () => {
  for (const [id, price] of Object.entries({"balsamo-botanico":7200000,"jabon-corporal-saponificado":3200000,"c-activa-vitamina-c":8600000,"ritual-mineral-exfoliante":12900000})) {
   expect(products.find(p=>p.id===id)).toMatchObject({amountInCents:price,active:true,image:"/products/autor/foto-pendiente.svg"});
  }
  expect(products.find(p=>p.id==="jabon-corporal-saponificado")).toMatchObject({stock:0,badge:"Agotado"});
 });
 it("rejects retired, unpriced, inactive and forged variants", () => {
  expect(resolveProduct(products,"kit-ritual-facial-mai")).toBeUndefined();
  expect(resolveProduct(products.map(p=>({...p,amountInCents:0})),"balsamos-labiales~maracuya")).toBeUndefined();
  expect(resolveProduct(products,"mnk-001~invented")).toBeUndefined();
  expect(resolveProduct(products.map(p=>({...p,active:false})),"mnk-001")).toBeUndefined();
 });
 it("resolves only canonical variant name, image and server price", () => {
  const balm = {...products.find(p=>p.id==="balsamos-labiales")!,amountInCents:2500000,price:"$25.000"};
  expect(resolveProduct([balm],balm.id)).toBeUndefined();
  expect(resolveProduct([balm],balm.id+"~fake")).toBeUndefined();
  expect(resolveProduct([balm],balm.id+"~maracuya~extra")).toBeUndefined();
  expect(resolveProduct([balm],balm.id+"~maracuya")).toMatchObject({name:"Bálsamos Labiales · Maracuyá",amountInCents:2500000,image:balm.variants![0].image});
 });
});
