import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import catalog from "./products.catalog.json";
import { resolveProduct, type Product } from "./products";
const products = catalog as Product[];
describe("catálogo de autor", () => {
 it("has 18 products, 34 photographs and three lip variants", () => {
  expect(products).toHaveLength(18);
  expect(products.flatMap(p=>p.images || [])).toHaveLength(34);
  expect(products.filter(p=>p.name.includes("Leave In"))).toHaveLength(1);
  expect(products.find(p=>p.id==="balsamos-labiales")?.variants).toHaveLength(3);
  for(const p of products) for(const image of [p.image,...p.images||[]]) expect(existsSync(path.join(process.cwd(),"public",image))).toBe(true);
 });
 it("rejects retired, unpriced, inactive and forged variants", () => {
  expect(resolveProduct(products,"kit-ritual-facial-mai")).toBeUndefined();
  expect(resolveProduct(products,"balsamos-labiales~maracuya")).toBeUndefined();
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
