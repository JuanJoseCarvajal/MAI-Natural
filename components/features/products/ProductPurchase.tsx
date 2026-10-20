"use client";
import {SiteText} from "@/components/common/SiteText";

import { useState } from "react";
import type { Product } from "@/lib/products";
import AddToCartButton from "@/components/features/cart/AddToCartButton";
import {useProductSelection} from "./ProductSelection";

export default function ProductPurchase({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState("");
  const selection = useProductSelection();
  const variant = product.variants?.find(item => item.id === variantId);
  const selectVariant = (id: string) => {
    setVariantId(id);
    const selected = product.variants?.find(item => item.id === id);
    selection?.selectImage(selected?.image || product.image);
  };
  return <div>
    {!!product.variants?.length && <label className="mb-4 block"><SiteText id="6c88bd9470bfc5e2df65">{"Elige los componentes"}</SiteText><select className="mt-2 block w-full rounded-lg border p-3" value={variantId} onChange={event => selectVariant(event.target.value)}>
        <option value=""><SiteText id="41d86e56e2798ceedaa7">{"Selecciona una opción"}</SiteText></option>
        {product.variants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>}
    {product.amountInCents <= 0 ? <p><SiteText id="e61a23a4a03058dcd91f">{"Precio pendiente de confirmación."}</SiteText></p> :
      product.variants?.length && !variant ? <p><SiteText id="6fbbb5007c4a922b4fdf">{"Selecciona una opción para agregar al carrito."}</SiteText></p> :
      <><p className="mb-3 text-sm text-slate-600"><SiteText id="694f256c876ad9347a59">{"Elaboración bajo pedido · preparación y entrega estimadas: 5 a 7 días hábiles."}</SiteText></p><AddToCartButton id={variant ? product.id + "~" + variant.id : product.id} name={variant ? product.name + " · " + variant.name : product.name} price={product.price} amountInCents={product.amountInCents} image={variant?.image ?? product.image} /></>}
  </div>;
}
