import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels } from "@/lib/products";
import AddToCartButton from "@/components/features/cart/AddToCartButton";
import ImageFrame from "@/components/ui/ImageFrame";
import { getAllProducts, getProductById } from "@/lib/products.server";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const products = await getAllProducts();
  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al catalogo
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2 items-start">
        <ImageFrame
          src={product.image}
          alt={product.name}
          loading="eager"
          frameClassName="rounded-2xl p-6 shadow-sm h-[360px]"
          fit="contain"
        />
        <div>
          <p className="mb-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900">
            {categoryLabels[product.category]}
          </p>
          <h1 className="text-3xl font-bold text-brand-900">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-brand-700">{product.price}</p>
          <p className="mt-1 text-sm text-slate-600">
            {product.rating.toFixed(1)} / 5 ({product.reviewsCount} reseñas)
          </p>
          <p className="mt-4 text-slate-700">{product.description}</p>

          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-slate-700">
            Tiempo de entrega estimado: 5 a 7 dias habiles. Cada producto se prepara de forma personalizada y artesanal, uno a uno y nunca en masa.
          </div>

          <div className="mt-4 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold text-brand-900">Metodo de pago</p>
            <p className="mt-1">Consignacion Bancolombia. La orden se crea primero y el pago se confirma despues de recibir tu comprobante.</p>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            {product.benefits.map((benefit) => (
              <li key={benefit}>• {benefit}</li>
            ))}
          </ul>

          <AddToCartButton
            id={product.id}
            name={product.name}
            price={product.price}
            amountInCents={product.amountInCents}
            image={product.image}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-brand-900">Tambien te puede gustar</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-md"
              >
                <ImageFrame
                  src={item.image}
                  alt={item.name}
                  frameClassName="h-16 w-16 shrink-0 rounded-lg"
                  imageClassName="rounded-lg"
                  fit="cover"
                />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold text-brand-900">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
