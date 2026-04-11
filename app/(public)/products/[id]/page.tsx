import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels, getProductById, products } from "@/lib/products";
import WompiCheckoutButton from "@/components/features/checkout/WompiCheckoutButton";
import AddToCartButton from "@/components/features/cart/AddToCartButton";
import ImageFrame from "@/components/ui/ImageFrame";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/products" className="text-sm text-brand-700 hover:underline">
        Volver al catalogo
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2 items-start">
        <ImageFrame
          src={product.image}
          alt={product.name}
          loading="eager"
          frameClassName="rounded-2xl p-6 shadow-sm"
          imageClassName="h-[360px]"
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
          <WompiCheckoutButton productId={product.id} />
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
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
              >
                <p className="font-semibold text-brand-900">{item.name}</p>
                <p className="text-sm text-slate-600">{item.price}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
