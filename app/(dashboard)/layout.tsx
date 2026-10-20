
import {SiteText} from "@/components/common/SiteText";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Mi cuenta | MAI Natural", robots: { index: false, follow: false }, alternates: { canonical: null } };
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-brand-900"><SiteText id="99596a292c2b3cea87b7">{"Mi cuenta"}</SiteText></h2>
        <p className="mt-1 text-sm text-slate-600"><SiteText id="1508021d629c0529042a">{"Gestiona tu perfil, pedidos y citas."}</SiteText></p>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account"><SiteText id="7b9f6ccb4ac8b236ec82">{"Resumen"}</SiteText></Link>
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account/orders"><SiteText id="cb0d44d85ce641120848">{"Pedidos"}</SiteText></Link>
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account/appointments"><SiteText id="f75a80fa6f21e68cbc37">{"Citas"}</SiteText></Link>
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account/profile"><SiteText id="6c93de5fd2a9902c0808">{"Perfil"}</SiteText></Link>
        </nav>
      </section>
      <section>{children}</section>
    </div>
  );
}
