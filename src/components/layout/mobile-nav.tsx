"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { esActual } from "./enlaces-nav";
import { NAV_LINKS } from "./nav-links";
import { SelectorTemaMovil } from "./selector-tema";

/** Menú móvil. `cuenta` llega del servidor (sesión) envuelta en su propio Suspense. */
export function MobileNav({ cuenta }: { cuenta: ReactNode }) {
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
        data-tour="menu-movil"
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 grid size-11 place-items-center text-tinta transition-transform duration-150 active:scale-[0.94]"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-linea bg-tarjeta shadow-[0_18px_40px_-24px_rgb(46_19_77/0.45)]"
      >
        <nav aria-label="Principal (móvil)" className="mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6">
          <ul className="divide-y divide-linea">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={esActual(l.href, pathname) ? "page" : undefined}
                  className="-mx-3 my-1 flex min-h-12 items-center rounded-xl px-3 font-display text-lg font-semibold text-tinta aria-[current=page]:bg-morado-activo aria-[current=page]:text-papel"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <SelectorTemaMovil />
          </div>
          <div className="mt-5">{cuenta}</div>
        </nav>
      </div>
    </div>
  );
}
