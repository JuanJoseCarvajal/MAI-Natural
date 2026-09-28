import "server-only";

import { readCatalog, writeCatalog, catalogTransaction, assertCatalogRevision } from "./catalog-store";
import type { CartItem } from "@/components/features/cart/CartContext";
import type { DiscountCode, DiscountEvaluation } from "@/lib/discounts";
import { getAllProductsForAdmin } from "@/lib/products.server";
import { resolveProduct } from "@/lib/products";


export type AdminDiscountInput = {
  id?: string;
  revision?: number;
  code: string;
  label: string;
  description?: string;
  active: boolean;
  kind: "percentage" | "fixed";
  percentage?: number;
  amountInCents?: number;
  scope: "all" | "category" | "products" | "kits";
  category?: "facial" | "capilar" | "corporal" | "kits";
  productIds?: string[];
  minimumSubtotalInCents?: number;
};

const readDiscountsFile = () => readCatalog<DiscountCode>("discounts");
const writeDiscountsFile = (items: DiscountCode[]) => writeCatalog("discounts", items);

export async function getAllDiscountsForAdmin() {
  return readDiscountsFile();
}

export async function getDiscountByCode(code: string) {
  const discounts = await readDiscountsFile();
  return discounts.find((discount) => discount.code.toUpperCase() === code.trim().toUpperCase());
}

function buildIdFromCode(code: string) {
  return code
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createDiscount(input: AdminDiscountInput) {
  return catalogTransaction(async () => {
  const discounts = await readDiscountsFile();
  const normalizedCode = input.code.trim().toUpperCase();
  if (discounts.some((discount) => discount.code === normalizedCode)) {
    throw new Error("Ya existe un código con ese nombre.");
  }

  const nextDiscount: DiscountCode = {
    id: input.id?.trim() || buildIdFromCode(normalizedCode),
    revision: 1,
    code: normalizedCode,
    label: input.label.trim(),
    description: input.description?.trim() || undefined,
    active: input.active,
    kind: input.kind,
    percentage: input.kind === "percentage" ? Number(input.percentage ?? 0) : undefined,
    amountInCents: input.kind === "fixed" ? Number(input.amountInCents ?? 0) : undefined,
    scope: input.scope,
    category: input.scope === "category" ? input.category : undefined,
    productIds: input.scope === "products" ? input.productIds?.filter(Boolean) ?? [] : undefined,
    minimumSubtotalInCents: Number(input.minimumSubtotalInCents ?? 0) || undefined,
  };

  if (discounts.some(discount => discount.id === nextDiscount.id)) throw new Error("Ya existe un descuento con ese identificador.");
  await writeDiscountsFile([nextDiscount, ...discounts]);
  return nextDiscount;
  });
}

export async function updateDiscount(id: string, input: AdminDiscountInput) {
  return catalogTransaction(async () => {
  const discounts = await readDiscountsFile();
  const current = discounts.find(item => item.id === id);
  if (!current) throw new Error('Descuento no encontrado.');
  assertCatalogRevision(current, input.revision);
  const normalizedCode = input.code.trim().toUpperCase();
  const repeated = discounts.find(
    (discount) => discount.id !== id && discount.code === normalizedCode
  );
  if (repeated) {
    throw new Error("Ya existe otro descuento con ese código.");
  }

  const nextDiscounts = discounts.map((discount) =>
    discount.id === id
      ? {
          ...discount,
          revision: (discount.revision ?? 0) + 1,
          code: normalizedCode,
          label: input.label.trim(),
          description: input.description?.trim() || undefined,
          active: input.active,
          kind: input.kind,
          percentage: input.kind === "percentage" ? Number(input.percentage ?? 0) : undefined,
          amountInCents: input.kind === "fixed" ? Number(input.amountInCents ?? 0) : undefined,
          scope: input.scope,
          category: input.scope === "category" ? input.category : undefined,
          productIds:
            input.scope === "products" ? input.productIds?.filter(Boolean) ?? [] : undefined,
          minimumSubtotalInCents: Number(input.minimumSubtotalInCents ?? 0) || undefined,
        }
      : discount
  );

  await writeDiscountsFile(nextDiscounts);
  return nextDiscounts.find((discount) => discount.id === id);
  });
}

export async function deleteDiscount(id: string, revision?: number) {
  return catalogTransaction(async () => {
  const discounts = await readDiscountsFile();
  const current = discounts.find(item => item.id === id);
  if (!current) throw new Error("Descuento no encontrado.");
  assertCatalogRevision(current, revision);
  await writeDiscountsFile(discounts.filter((discount) => discount.id !== id));
  });
}

export async function evaluateDiscountCode(
  code: string,
  items: Pick<CartItem, "id" | "quantity">[]
): Promise<DiscountEvaluation> {
  const discount = await getDiscountByCode(code);

  if (!discount || !discount.active) {
    return {
      valid: false,
      message: "Ese código no existe o no está activo.",
      discountAmountInCents: 0,
      discountedSubtotalInCents: 0,
      matchedItemIds: [],
    };
  }

  const products = await getAllProductsForAdmin();
  const enrichedItems = items
    .map((item) => {
      const product = resolveProduct(products, item.id);
      if (!product) return null;
      return {
        ...item,
        product,
        lineTotal: product.amountInCents * item.quantity,
      };
    })
    .filter(
      (
        item
      ): item is {
        id: string;
        quantity: number;
        product: Awaited<ReturnType<typeof getAllProductsForAdmin>>[number];
        lineTotal: number;
      } => Boolean(item)
    );

  if (enrichedItems.length !== items.length) return { valid: false, message: "Revisa los productos de tu carrito.", discountAmountInCents: 0, discountedSubtotalInCents: 0, matchedItemIds: [] };
  const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  if (discount.minimumSubtotalInCents && subtotal < discount.minimumSubtotalInCents) {
    return {
      valid: false,
      message: "El carrito no alcanza el subtotal mínimo para aplicar este código.",
      discountAmountInCents: 0,
      discountedSubtotalInCents: subtotal,
      matchedItemIds: [],
    };
  }

  const eligibleItems = enrichedItems.filter((item) => {
    if (discount.scope === "all") return true;
    if (discount.scope === "kits") return item.product.category === "kits";
    if (discount.scope === "category") return item.product.category === discount.category;
    if (discount.scope === "products") {
      return discount.productIds?.includes(item.product.id.split("~")[0]) ?? false;
    }
    return false;
  });

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      message: "Este código no aplica a los productos de tu carrito.",
      discountAmountInCents: 0,
      discountedSubtotalInCents: subtotal,
      matchedItemIds: [],
    };
  }

  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.lineTotal, 0);
  let discountAmount = 0;

  if (discount.kind === "percentage") {
    discountAmount = Math.round(eligibleSubtotal * ((discount.percentage ?? 0) / 100));
  } else {
    discountAmount = Math.min(discount.amountInCents ?? 0, eligibleSubtotal);
  }

  return {
    valid: true,
    discountAmountInCents: discountAmount,
    discountedSubtotalInCents: subtotal - discountAmount,
    matchedItemIds: eligibleItems.map((item) => item.product.id),
    code: discount.code,
    label: discount.label,
  };
}
