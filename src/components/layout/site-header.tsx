import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MobileNav } from "./mobile-nav";
import { SelectorTema } from "./selector-tema";
import { AccesoEscritorio, AccesoMovil, CuentaEscritorio, CuentaMovil } from "./zona-cuenta";
import { EnlacesNav } from "./enlaces-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-tarjeta/95 backdrop-blur-sm supports-[backdrop-filter]:bg-tarjeta/85 print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-20 lg:gap-4 lg:px-8 xl:gap-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/brand/pdul-ya-horizontal-divisor.png"
            alt="PDUL YA, ir al inicio"
            width={1200}
            height={402}
            loading="eager"
            fetchPriority="high"
            className="h-9 w-auto lg:h-11 oscuro:hidden"
          />
          {/* Versión para fondo oscuro (wordmark en blanco); oculta, no se descarga en claro. */}
          <Image
            src="/brand/oscuro/pdul-ya-horizontal-divisor.png"
            alt="PDUL YA, ir al inicio"
            width={1200}
            height={402}
            loading="lazy"
            className="hidden h-9 w-auto lg:h-11 oscuro:block"
          />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          {/* Una sola línea por enlace: entre 1024 y 1280 px el menú se compacta. */}
          <EnlacesNav />
        </nav>

        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <SelectorTema />
          <div data-tour="cuenta">
            <Suspense fallback={<AccesoEscritorio />}>
              <CuentaEscritorio />
            </Suspense>
          </div>
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
