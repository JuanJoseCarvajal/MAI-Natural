"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
const links = [{href:"/products",label:"La tienda"},{href:"/routines",label:"Tu ritual"},{href:"/services",label:"Asesorías"},{href:"/blog",label:"Diario MAI"},{href:"/subscriptions",label:"Círculo MAI"}];
export default function Navigation() {
  const pathname = usePathname();
  const {data:session} = useSession();
  const [open,setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false),[pathname]);
  useEffect(() => {
    if(!open) return;
    const onKey = (e:KeyboardEvent) => {if(e.key === "Escape") {setOpen(false);button.current?.focus();}};
    const onClick = (e:MouseEvent) => {if(!nav.current?.contains(e.target as Node)) setOpen(false);};
    document.addEventListener("keydown",onKey);document.addEventListener("click",onClick);
    return () => {document.removeEventListener("keydown",onKey);document.removeEventListener("click",onClick);};
  },[open]);
  return <nav ref={nav} className="main-nav" aria-label="Navegación principal"><button ref={button} className="menu-toggle icon-button" aria-expanded={open} aria-controls="main-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}><svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" aria-hidden="true">{open ? <path d="m5 5 14 14M19 5 5 19"/> : <path d="M3 7h18M3 16h18"/>}</svg></button><div id="main-menu" className={`nav-links ${open ? "is-open" : ""}`}>{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(link.href) ? "page" : undefined}>{link.label}</Link>)}<Link href={session ? "/account" : "/login"} onClick={() => setOpen(false)} className="account-link">Mi cuenta</Link>{session && <button className="nav-signout" onClick={() => signOut({callbackUrl:"/"})}>Salir</button>}</div></nav>;
}
