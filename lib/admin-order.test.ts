import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("@/lib/auth",()=>({auth:vi.fn(async()=>({user:{id:"admin-fixture",role:"admin"}}))}));
// Authorization itself is covered independently in admin-access.test.ts.
vi.mock("@/lib/admin-access",()=>({requireAdmin:async()=>{const {auth}=await import('./auth');const session=await auth();if(!session?.user)throw new Error('No autorizado');return {id:'admin-fixture',email:'hola@mainatural.com'};}}));
vi.mock("server-only",()=>({}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
import { db } from "./db";
import { isPaidOrder, validateOrderPatch } from "./admin-order";
import { updateAdminOrder, verifyAdminWompiOrder, quoteAdminOrder } from "@/app/admin/actions";
import { auth } from "./auth";
async function fixture(method="bank_transfer_bancolombia") {return db.order.create({data:{userId:"fixture",customerName:"Prueba",customerEmail:"test@example.com",customerPhone:"3001234567",items:[],total:12700000,status:"pending_confirmation",paymentStatus:"pending_confirmation",paymentMethod:method}});}
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.mocked(auth).mockResolvedValue({user:{id:"admin-fixture",role:"admin"}} as never);});
describe("backoffice order integrity",()=>{
 it("preserves method and payment status when only tracking changes",async()=>{const o=await fixture("wompi_sandbox");const r=await updateAdminOrder(o.id,{notes:"Verificar webhook",shippingStatus:undefined});expect(r.order?.paymentMethod).toBe("wompi_sandbox");expect(r.order?.paymentStatus).toBe("pending_confirmation");});
 it("rejects arbitrary fields, manual sandbox approval and unpaid dispatch",async()=>{const o=await fixture();expect(()=>validateOrderPatch(o,{paymentMethod:"other"})).toThrow();expect(()=>validateOrderPatch(o,{shippingStatus:"order_sent"})).toThrow();const s=await fixture("wompi_sandbox");expect(()=>validateOrderPatch(s,{paymentStatus:"confirmed"})).toThrow();expect(isPaidOrder({...s,paymentStatus:"confirmed"})).toBe(false);expect(isPaidOrder({...o,paymentStatus:"confirmed"})).toBe(true);});
 it("requires admin for order writes",async()=>{const o=await fixture();vi.mocked(auth).mockResolvedValue(null as never);await expect(updateAdminOrder(o.id,{notes:"test"})).rejects.toThrow("No autorizado");});
 it("recovers verified sandbox payments but refuses wrong amount",async()=>{const o=await fixture();vi.stubEnv("WOMPI_SANDBOX_ENABLED","true");vi.stubEnv("WOMPI_PUBLIC_KEY","pub_test_fixture");vi.stubEnv("WOMPI_INTEGRITY_SECRET","test_integrity_fixture");vi.stubEnv("WOMPI_EVENTS_SECRET","test_events_fixture");const tx={id:"test-123",status:"APPROVED",currency:"COP",reference:`mai-${o.id}`,amount_in_cents:1};vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({data:tx}))));await expect(verifyAdminWompiOrder(o.id,tx.id)).rejects.toThrow("no coincide");tx.amount_in_cents=o.total;const result=await verifyAdminWompiOrder(o.id,tx.id);expect(result.order?.paymentStatus).toBe("sandbox_approved");expect(result.order?.status).toBe("pending_confirmation");expect(result.order?.paymentMethod).toBe("wompi_sandbox");});
 it("quotes shipping without accumulating previous quotes and freezes after checkout",async()=>{const o=await fixture("wompi");const first=await quoteAdminOrder(o.id,1000000);expect(first.order?.total).toBe(13700000);const second=await quoteAdminOrder(o.id,2000000);expect(second.order?.total).toBe(14700000);expect(second.order?.quoteVersion).not.toBe(first.order?.quoteVersion);await db.order.update({where:{id:o.id},data:{paymentStarted:true}});await expect(quoteAdminOrder(o.id,0)).rejects.toThrow("No se puede modificar");expect(()=>validateOrderPatch(o,{paymentStatus:"confirmed"})).toThrow("proveedor");});

});
