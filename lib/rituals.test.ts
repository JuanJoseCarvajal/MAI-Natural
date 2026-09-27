import { describe,it,expect } from "vitest";
import { baseRituals, canAddSelection, canSelectProduct, selectionTotal } from "./rituals";
import catalog from "./products.catalog.json";
import type { Product } from "./products";
const products=catalog as Product[];
describe("ritual selections",()=>{
 it("uses two existing three-product selections and matching categories",()=>{expect(baseRituals).toHaveLength(2);for(const base of baseRituals){expect(base.productIds).toHaveLength(3);for(const id of base.productIds)expect(products.find(p=>p.id===id)?.category).toBe(base.id);}});
 it("sums confirmed prices and blocks incomplete pricing",()=>{const chosen=baseRituals[0].productIds.map(id=>products.find(p=>p.id===id)!);expect(selectionTotal(chosen)).toBe(20200000);expect(canAddSelection(chosen,[])).toBe(true);expect(canAddSelection(chosen.map(p=>({...p,amountInCents:0})),[])).toBe(false);});
 it("allows active products because every order is prepared on demand",()=>{const p=products[0];expect(canSelectProduct(p)).toBe(true);expect(canSelectProduct({...p,active:false})).toBe(false);expect(canSelectProduct(undefined)).toBe(false);});
 it("allows ritual selections without inventory quantity limits",()=>{const p=products[0];expect(canAddSelection([p],[{id:p.id,quantity:20}])).toBe(true);expect(canAddSelection([],[])).toBe(false);});
});
