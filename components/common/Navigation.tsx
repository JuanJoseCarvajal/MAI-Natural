"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Productos" },
  { href: "/routines", label: "Rutinas" },
  { href: "/services", label: "Servicios" },
  { href: "/subscriptions", label: "Club MAI", disabled: true, disabledLabel: "Proximamente" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleDesktopChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    };

    handleDesktopChange(mediaQuery);
    mediaQuery.addEventListener("change", handleDesktopChange);
    return () => {
      mediaQuery.removeEventListener("change", handleDesktopChange);
    };
  }, []);

  const closeAllMenus = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const renderPrimaryLinks = (mobile = false) =>
    publicNavItems.map((item) =>
      item.disabled ? (
        <span
          key={item.href}
          aria-disabled="true"
          className={
            mobile
              ? "flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-base font-semibold text-brand-900"
              : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/65"
          }
        >
          <span>{item.label}</span>
          <span
            className={
              mobile
                ? "rounded-full bg-brand-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
                : "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
            }
          >
            {item.disabledLabel}
          </span>
        </span>
      ) : (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          onClick={closeAllMenus}
          className={
            mobile
              ? "rounded-2xl px-4 py-3 text-base font-semibold text-brand-900 transition hover:bg-brand-50"
              : linkClass(item.href)
          }
        >
          {item.label}
        </Link>
      )
    );

  return (
    <nav className="relative">
      <div className="hidden items-center gap-2 text-sm font-medium md:text-base lg:flex">
        {renderPrimaryLinks()}

        {status === "authenticated" && (
          <Link href="/account" aria-current={isActive("/account") ? "page" : undefined} className={linkClass("/account")}>
            Mi cuenta
          </Link>
        )}

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
              onClick={() => setUserMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label="Menú de usuario"
            >
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Avatar"}
                  width={28}
                  height={28}
                  unoptimized
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

            {userMenuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/10"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <Link
                  href="/account/profile"
                  onClick={closeAllMenus}
                  className="block rounded-t-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
                >
                  Mi perfil
                </Link>
                <Link
                  href="/account"
                  onClick={closeAllMenus}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
                >
                  Mi cuenta
                </Link>
                <button
                  onClick={() => {
                    closeAllMenus();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="block w-full rounded-b-xl px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-panel"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-brand-900/45 lg:hidden"
            onClick={closeAllMenus}
          />
          <div
            id="mobile-navigation-panel"
            className="absolute right-0 top-full z-50 mt-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 rounded-3xl border border-brand-100 bg-white p-3 text-brand-900 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {renderPrimaryLinks(true)}
            </div>

            <div className="h-px bg-brand-100" />

            {status === "loading" && (
              <div className="h-12 animate-pulse rounded-2xl bg-brand-50" />
            )}

            {status === "unauthenticated" && (
              <Link
                href="/login"
                aria-current={isActive("/login") ? "page" : undefined}
                onClick={closeAllMenus}
                className="rounded-2xl bg-brand-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
              >
                Iniciar sesión
              </Link>
            )}

            {status === "authenticated" && (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "Avatar"}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">
                      {session.user?.name ?? "Usuario"}
                    </p>
                    <p className="truncate text-xs text-brand-700/80">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/account"
                  aria-current={isActive("/account") ? "page" : undefined}
                  onClick={closeAllMenus}
                  className="rounded-2xl px-4 py-3 text-base font-semibold text-brand-900 transition hover:bg-brand-50"
                >
                  Mi cuenta
                </Link>
                <Link
                  href="/account/profile"
                  onClick={closeAllMenus}
                  className="rounded-2xl px-4 py-3 text-base font-semibold text-brand-900 transition hover:bg-brand-50"
                >
                  Mi perfil
                </Link>
                <button
                  onClick={() => {
                    closeAllMenus();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
