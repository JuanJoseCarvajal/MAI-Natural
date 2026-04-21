import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/common/Navigation";
import CartIcon from "@/components/features/cart/CartIcon";
import CartDrawer from "@/components/features/cart/CartDrawer";

export default function Header() {
  return (
    <>
      <header className="bg-brand-900 text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center py-4">
          <Link href="/" aria-label="Ir al inicio" className="flex items-center">
            <Image
              src="/ima/MAI-Logo.svg"
              alt="MAI Natural"
              width={140}
              height={56}
              priority
              className="h-14 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Navigation />
            <CartIcon />
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
