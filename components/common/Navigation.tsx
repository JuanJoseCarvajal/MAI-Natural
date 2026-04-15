"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Productos" },
  { href: "/services", label: "Servicios" },
  { href: "/subscriptions", label: "Club MAI" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    isActive(href)
      ? "rounded-full bg-white/14 px-3 py-1 text-white ring-1 ring-white/20"
      : "rounded-full px-3 py-1 text-white/80 transition hover:bg-white/10 hover:text-brand-300";

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <nav className="flex items-center gap-2 text-sm md:text-base font-medium">
      {/* Links públicos siempre visibles */}
      {publicNavItems.map((item) => (
        <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={linkClass(item.href)}>
          {item.label}
        </Link>
      ))}

      {/* Mi cuenta: solo si hay sesión */}
      {status === "authenticated" && (
        <Link href="/account" aria-current={isActive("/account") ? "page" : undefined} className={linkClass("/account")}>
          Mi cuenta
        </Link>
      )}

      {/* Zona de usuario */}
      {status === "loading" && (
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
      )}

      {status === "unauthenticated" && (
        <Link
          href="/login"
          aria-current={isActive("/login") ? "page" : undefined}
          className={linkClass("/login")}
        >
          Iniciar sesión
        </Link>
      )}

      {status === "authenticated" && (
        <div className="relative ml-2">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
            aria-label="Menú de usuario"
          >
            {/* Avatar: imagen si existe, sino iniciales */}
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Avatar"}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                {initials}
              </span>
            )}
            <span className="max-w-[120px] truncate text-sm font-medium">
              {session.user?.name ?? session.user?.email}
            </span>
            <svg className="h-3 w-3 opacity-70" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L1 3h10z" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/10"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href="/account/profile"
                onClick={() => setMenuOpen(false)}
                className="block rounded-t-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
              >
                Mi perfil
              </Link>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
              >
                Mi cuenta
              </Link>
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                className="block w-full rounded-b-xl px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
