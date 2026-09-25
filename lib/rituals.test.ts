import { describe,it,expect } from "vitest";
import { baseRituals, canAddSelection, canSelectProduct, selectionTotal } from "./rituals";
import catalog from "./products.catalog.json";
import type { Product } from "./products";
const products=catalog as Product[];
describe("ritual selections",()=>{
 it("uses two existing three-product selections and matching categories",()=>{expect(baseRituals).toHaveLength(2);for(const base of baseRituals){expect(base.productIds).toHaveLength(3);for(const id of base.productIds)expect(products.find(p=>p.id===id)?.category).toBe(base.id);}});
 it("sums confirmed prices and blocks incomplete pricing",()=>{const chosen=baseRituals[0].productIds.map(id=>products.find(p=>p.id===id)!);expect(selectionTotal(chosen)).toBe(20200000);expect(canAddSelection(chosen,[])).toBe(true);expect(canAddSelection(chosen.map(p=>({...p,amountInCents:0})),[])).toBe(false);});
 it("allows unspecified stock consistently with checkout but blocks known unavailability",()=>{const p=products[0];expect(canSelectProduct({...p,stock:undefined})).toBe(true);expect(canSelectProduct({...p,stock:0})).toBe(false);expect(canSelectProduct({...p,active:false})).toBe(false);expect(canSelectProduct(undefined)).toBe(false);});
 it("includes existing cart quantities before adding a ritual",()=>{const p={...products[0],stock:2};expect(canAddSelection([p],[{id:p.id,quantity:1}])).toBe(true);expect(canAddSelection([p],[{id:p.id,quantity:2}])).toBe(false);expect(canAddSelection([],[])).toBe(false);expect(canAddSelection([{...p,stock:undefined}],[{id:p.id,quantity:20}])).toBe(false);});
});
