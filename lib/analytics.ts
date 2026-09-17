"use client";

type EcommerceItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", name, params ?? {});
}

export function trackAddToCart(item: EcommerceItem) {
  trackEvent("add_to_cart", {
    currency: "COP",
    value: item.price,
    items: [item],
  });

  if (typeof window !== "undefined") {
    window.fbq?.("track", "AddToCart", {
      content_ids: [item.item_id],
      content_name: item.item_name,
      currency: "COP",
      value: item.price,
    });
  }
}

export function trackBeginCheckout(value: number, items: EcommerceItem[]) {
  trackEvent("begin_checkout", {
    currency: "COP",
    value,
    items,
  });

  if (typeof window !== "undefined") {
    window.fbq?.("track", "InitiateCheckout", {
      currency: "COP",
      value,
      num_items: items.reduce((total, item) => total + (item.quantity ?? 1), 0),
    });
  }
}
