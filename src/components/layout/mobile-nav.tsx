"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cierra el menú al navegar.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 grid size-11 place-items-center text-tinta transition-transform duration-150 active:scale-[0.94]"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-linea bg-papel shadow-[0_18px_40px_-24px_rgb(35_42_54/0.45)]"
      >
        <nav aria-label="Principal (móvil)" className="mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6">
          <ul className="divide-y divide-linea">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className="flex min-h-12 items-center font-display text-lg font-semibold text-tinta aria-[current=page]:text-rojo"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/ingresar"
              className="grid min-h-12 place-items-center rounded-xl border border-tinta font-display font-semibold text-tinta"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="grid min-h-12 place-items-center rounded-xl bg-rojo font-display font-bold text-papel active:scale-[0.97]"
            >
              Regístrate
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
