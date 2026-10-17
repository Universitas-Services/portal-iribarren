import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Instagram } from "@/components/icons";
import { NAV_LINKS } from "./nav-links";

const MARCO_LEGAL = [
  // Enlaces oficiales pendientes de confirmar con el cliente.
  { href: "/conoce-el-pdul#marco-legal", label: "Decreto 48-2026" },
  { href: "/conoce-el-pdul#marco-legal", label: "LOOU" },
  { href: "/conoce-el-pdul#marco-legal", label: "Ordenanza de Gobierno Electrónico" },
];

const enlace = "transition-colors duration-150 hover:text-rojo hover:underline";

/**
 * Footer claro y compacto (el logo de la Alcaldía no se lee sobre fondos oscuros):
 * PDUL YA a la izquierda, navegación al centro y Alcaldía con el alcalde a la derecha.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-linea bg-papel text-tinta print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 sm:px-6 sm:py-8 lg:flex-nowrap lg:gap-10 lg:px-8">
        <Image
          src="/brand/pdul-ya-horizontal.png"
          alt="PDUL YA"
          width={960}
          height={362}
          className="h-8 w-auto sm:h-10"
        />

        {/* En teléfono el menú ya está en el encabezado; aquí se omite para no alargar el pie. */}
        <nav
          aria-label="Secciones del portal"
          className="hidden sm:order-last sm:block sm:w-full lg:order-none lg:w-auto"
        >
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-display text-[0.9375rem] font-semibold text-noche">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={enlace}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Marcas de gestión: van en texto hasta recibir sus archivos oficiales. */}
        <div className="flex items-center gap-4 lg:flex-row-reverse lg:text-right">
          <Image
            src="/brand/alcaldia-iribarren.png"
            alt="Alcaldía Bolivariana de Iribarren"
            width={720}
            height={229}
            className="h-9 w-auto sm:h-11"
          />
          <div className="hidden text-sm leading-snug sm:block">
            <p className="font-display font-bold text-noche">Yanys Agüero · Alcalde</p>
            <p className="text-tinta/75">Iribarren para la Vida · Gente que Resuelve</p>
          </div>
        </div>

        <p className="w-full text-xs leading-snug text-tinta/75 sm:hidden">
          <span className="font-display font-bold text-noche">Yanys Agüero · Alcalde</span> ·
          Iribarren para la Vida · Gente que Resuelve
        </p>
      </div>

      <div className="border-t border-linea">
        <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-3 text-xs sm:gap-3 sm:px-6 sm:py-4 sm:text-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:gap-x-5">
            <address className="inline-flex items-center gap-1.5 not-italic">
              <MapPin size={14} aria-hidden="true" className="shrink-0 text-rojo" />
              Palacio Municipal, Barquisimeto
            </address>
            <a
              href="https://www.instagram.com/alcaldiairibarren/"
              rel="noopener noreferrer"
              target="_blank"
              className={`inline-flex items-center gap-1.5 ${enlace}`}
            >
              <Instagram size={14} className="text-rojo" />
              @alcaldiairibarren
            </a>
            <a
              href="https://www.instagram.com/yanysaguerove/"
              rel="noopener noreferrer"
              target="_blank"
              className={`inline-flex items-center gap-1.5 ${enlace}`}
            >
              <Instagram size={14} className="text-rojo" />
              @yanysaguerove
            </a>
          </div>
          <ul
            aria-label="Marco legal"
            className="flex flex-wrap gap-x-4 gap-y-1.5 text-tinta/80 sm:gap-x-5"
          >
            {MARCO_LEGAL.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={enlace}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-rojo text-papel">
        <p className="mx-auto max-w-7xl px-4 py-2 text-[0.6875rem] leading-snug sm:px-6 sm:py-3 sm:text-sm sm:leading-relaxed lg:px-8">
          PDUL YA es exclusivo del Plan de Desarrollo Urbano Local. Los permisos y trámites urbanos
          se gestionan en la Dirección de Planificación y Control Urbano (DPCU).
        </p>
      </div>
    </footer>
  );
}
