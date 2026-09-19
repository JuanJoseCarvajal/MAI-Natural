"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./breadcrumbs.module.css";

type Crumb = { label: string; href?: string };
const pages: Record<string, string> = {
  "/products": "Tienda", "/routines": "Tu ritual", "/services": "Asesorías",
  "/services/payment": "Resultado del pago", "/blog": "Diario MAI",
  "/subscriptions": "Círculo MAI", "/terms": "Información de compra",
  "/checkout": "Finalizar compra", "/checkout/result": "Estado del pedido",
  "/login": "Iniciar sesión", "/register": "Crear cuenta",
  "/forgot-password": "Recuperar contraseña", "/reset-password": "Restablecer contraseña",
  "/account": "Mi cuenta", "/account/orders": "Mis pedidos",
  "/account/appointments": "Mis citas", "/account/profile": "Mi perfil",
  "/admin": "Administración", "/admin/products": "Productos",
  "/admin/inventory": "Inventario", "/admin/orders": "Pedidos",
  "/admin/payments": "Pagos", "/admin/shipping": "Envíos", "/admin/sales": "Ventas",
  "/admin/discounts": "Descuentos", "/admin/appointments": "Citas", "/admin/users": "Usuarios",
};

export default function Breadcrumbs({ items, contained = false }: { items?: Crumb[]; contained?: boolean }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  if (pathname === "/") return null;
  let trail = items;
  if (!trail) {
    if (!pages[pathname]) return null;
    trail = pathname.split("/").filter(Boolean).map((_,index,parts) => {
      const path = "/" + parts.slice(0,index+1).join("/");
      return { label: pages[path], ...(path === pathname ? {} : { href: path }) };
    }).filter(item=>Boolean(item.label));
  }
  if (!trail.length) return null;
  const crumbs: Crumb[] = [{ label: "Inicio", href: "/" }, ...trail];
  return <nav aria-label="Migas de pan" className={`${styles.breadcrumbs} ${contained ? styles.contained : ""}`}>
    <ol>{crumbs.map((crumb,index) => <li key={`${index}-${crumb.label}`}>
      {index > 0 && <span aria-hidden="true" className={styles.separator}>/</span>}
      {index === crumbs.length-1 ? <span aria-current="page">{crumb.label}</span> : <Link href={crumb.href || "/"}>{crumb.label}</Link>}
    </li>)}</ol>
  </nav>;
}
