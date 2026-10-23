import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MobileNav } from "./mobile-nav";
import { AccesoEscritorio, AccesoMovil, CuentaEscritorio, CuentaMovil } from "./zona-cuenta";
import { EnlacesNav } from "./enlaces-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-papel/95 backdrop-blur-sm supports-[backdrop-filter]:bg-papel/85 print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-20 lg:gap-4 lg:px-8 xl:gap-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/brand/pdul-ya-horizontal-divisor.png"
            alt="PDUL YA, ir al inicio"
            width={1200}
            height={411}
            loading="eager"
            fetchPriority="high"
            className="h-9 w-auto lg:h-11"
          />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          {/* Una sola línea por enlace: entre 1024 y 1280 px el menú se compacta. */}
          <EnlacesNav />
        </nav>

        <div className="hidden shrink-0 lg:block">
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
