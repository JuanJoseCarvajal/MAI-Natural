import { describe,it,expect } from "vitest";
import { baseRituals, canAddSelection, canSelectProduct, selectionTotal } from "./rituals";
import catalog from "./products.catalog.json";
import type { Product } from "./products";
const products=catalog as Product[];
describe("ritual selections",()=>{
 it("uses two existing three-product kits and matching categories",()=>{expect(baseRituals).toHaveLength(2);for(const base of baseRituals){const kit=products.find(p=>p.id===base.kitId);expect(kit?.category).toBe("kits");expect(base.productIds).toHaveLength(3);for(const id of base.productIds)expect(products.find(p=>p.id===id)?.category).toBe(base.id);}});
 it("keeps kit pricing distinct from a customized sum",()=>{const base=baseRituals[0];const kit=products.find(p=>p.id===base.kitId)!;const chosen=base.productIds.map(id=>products.find(p=>p.id===id)!);expect(selectionTotal(chosen)).toBe(19500000);expect(kit.amountInCents).toBe(17160000);});
 it("allows unspecified stock consistently with checkout but blocks known unavailability",()=>{const p=products[0];expect(canSelectProduct({...p,stock:undefined})).toBe(true);expect(canSelectProduct({...p,stock:0})).toBe(false);expect(canSelectProduct({...p,active:false})).toBe(false);expect(canSelectProduct(undefined)).toBe(false);});
 it("includes existing cart quantities before adding a ritual",()=>{const p={...products[0],stock:2};expect(canAddSelection([p],[{id:p.id,quantity:1}])).toBe(true);expect(canAddSelection([p],[{id:p.id,quantity:2}])).toBe(false);expect(canAddSelection([],[])).toBe(false);expect(canAddSelection([{...p,stock:undefined}],[{id:p.id,quantity:20}])).toBe(false);});
});
