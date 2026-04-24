import type { ProductCategory } from "@/lib/products";

export type DiscountScope = "all" | "category" | "products" | "kits";
export type DiscountKind = "percentage" | "fixed";

export type DiscountCode = {
  id: string;
  code: string;
  label: string;
  description?: string;
  active: boolean;
  kind: DiscountKind;
  percentage?: number;
  amountInCents?: number;
  scope: DiscountScope;
  category?: ProductCategory;
  productIds?: string[];
  minimumSubtotalInCents?: number;
};

export type DiscountEvaluation = {
  valid: boolean;
  message?: string;
  discountAmountInCents: number;
  discountedSubtotalInCents: number;
  matchedItemIds: string[];
  code?: string;
  label?: string;
};
