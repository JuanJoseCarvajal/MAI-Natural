import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type { CartItem } from "@/components/features/cart/CartContext";
import type { DiscountCode, DiscountEvaluation } from "@/lib/discounts";
import { getAllProductsForAdmin } from "@/lib/products.server";

const discountsPath = path.join(process.cwd(), "lib", "discounts.catalog.json");

export type AdminDiscountInput = {
  id?: string;
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

async function readDiscountsFile() {
  const raw = await fs.readFile(discountsPath, "utf8");
  return JSON.parse(raw) as DiscountCode[];
}

async function writeDiscountsFile(discounts: DiscountCode[]) {
  await fs.writeFile(discountsPath, `${JSON.stringify(discounts, null, 2)}\n`, "utf8");
}

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
  const discounts = await readDiscountsFile();
  const normalizedCode = input.code.trim().toUpperCase();
  if (discounts.some((discount) => discount.code === normalizedCode)) {
    throw new Error("Ya existe un código con ese nombre.");
  }

  const nextDiscount: DiscountCode = {
    id: input.id?.trim() || buildIdFromCode(normalizedCode),
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

  await writeDiscountsFile([nextDiscount, ...discounts]);
  return nextDiscount;
}

export async function updateDiscount(id: string, input: AdminDiscountInput) {
  const discounts = await readDiscountsFile();
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
}

export async function deleteDiscount(id: string) {
  const discounts = await readDiscountsFile();
  await writeDiscountsFile(discounts.filter((discount) => discount.id !== id));
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
      const product = products.find((product) => product.id === item.id);
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
      return discount.productIds?.includes(item.product.id) ?? false;
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
