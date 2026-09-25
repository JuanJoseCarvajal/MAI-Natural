
import { SiteText } from "@/components/common/SiteText";
export default function OrdersPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow ring-1 ring-brand-100">
      <h1 className="text-2xl font-bold text-brand-900"><SiteText id="a5fb0ea92b54e7d22028">{"Mis ordenes"}</SiteText></h1>
      <p className="mt-2 text-slate-700"><SiteText id="7267d762ebf55567ee50">{"Aqui veras tu historial de compras."}</SiteText></p>
    </div>
  );
}
