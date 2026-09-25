import type { Product } from "./products";
export const baseRituals = [
  { id: "facial", title: "Una pausa para tu rostro", label: "Ritual facial", description: "Limpieza, frescura y cuidado de día: tres momentos para empezar a cuidar tu rostro con intención.", productIds: ["espuma-lavanda-ortiga", "fa-lam-120-1", "fa-lnd-70"], steps: ["Limpia", "Prepara", "Cuida"], note: "Una selección inicial de cuidado facial. Consulta el modo de uso de cada producto; no sustituye una recomendación individual." },
  { id: "capilar", title: "Un momento para tu cabello", label: "Ritual capilar", description: "Shampoo, Leave In y crema de peinar: una base para acompañar el lavado y el peinado.", productIds: ["mnk-001", "acondicionador-leave-in", "ca-hcc-500"], steps: ["Lava", "Acondiciona", "Peina"], note: "Incluye Herbal Curl, crema para peinar. Si buscas otro acabado o prefieres una bruma, adapta la selección en «Crea el tuyo»." },
] as const;
export function canSelectProduct(product: Product | undefined) {
  return Boolean(product && !product.variants?.length && product.active !== false && Number.isSafeInteger(product.amountInCents) && product.amountInCents > 0 && (product.stock === undefined || product.stock > 0));
}
export function selectionTotal(products: Product[]) { return products.reduce((sum, product) => sum + product.amountInCents, 0); }
export function canAddSelection(products: Product[], cart: {id:string;quantity:number}[]) {
  return products.length > 0 && products.every(product => canSelectProduct(product) && (cart.find(item=>item.id===product.id)?.quantity ?? 0) + 1 <= Math.min(product.stock ?? 20,20));
}
