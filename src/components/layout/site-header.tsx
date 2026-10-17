import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MobileNav } from "./mobile-nav";
import { AccesoEscritorio, AccesoMovil, CuentaEscritorio, CuentaMovil } from "./zona-cuenta";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-papel/95 backdrop-blur-sm supports-[backdrop-filter]:bg-papel/85 print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="PDUL YA, ir al inicio">
          <Image
            src="/brand/pdul-ya-horizontal-divisor.png"
            alt=""
            width={960}
            height={346}
            loading="eager"
            fetchPriority="high"
            className="h-9 w-auto lg:h-11"
          />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="px-3 py-2 font-display text-[0.9375rem] font-semibold text-tinta transition-colors duration-150 hover:text-rojo"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Suspense fallback={<AccesoEscritorio />}>
            <CuentaEscritorio />
          </Suspense>
        </div>

        <MobileNav
          cuenta={
            <Suspense fallback={<AccesoMovil />}>
              <CuentaMovil />
            </Suspense>
          }
        />
      </div>
    </header>
  );
}
