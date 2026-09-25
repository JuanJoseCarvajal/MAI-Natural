
import { SiteText } from "@/components/common/SiteText";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/common/Navigation";
import CartIcon from "@/components/features/cart/CartIcon";
import CartDrawer from "@/components/features/cart/CartDrawer";
export default function Header() {
  return <><div className="announcement-bar"><SiteText id="d884ea73fb52445c303b">{"Hecho uno a uno, para cuidarte cada día. "}</SiteText><Link href="/routines"><SiteText id="bc7d8b291ebe245e1904">{"Descubre tu ritual "}</SiteText><span aria-hidden="true">↗</span></Link></div><header className="site-header"><div className="header-inner"><Link href="/" aria-label="MAI Natural, inicio" className="brand-logo"><Image src="/ima/MAI-Logo.svg" alt="MAI Natural" width={96} height={56} priority /><span><SiteText id="3609bda2f5c882a16c27">{"COSMÉTICA"}</SiteText><br /><SiteText id="3afbbf0405495fa20cff">{"DE AUTOR"}</SiteText></span></Link><Navigation /><div className="header-tools"><Link href="/products?search=" aria-label="Buscar productos" className="icon-button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></Link><CartIcon /></div></div></header><CartDrawer /></>;
}
