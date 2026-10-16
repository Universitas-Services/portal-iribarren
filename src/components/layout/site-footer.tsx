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
    <footer className="mt-auto border-t border-linea bg-papel text-tinta">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-8">
        <Image
          src="/brand/pdul-ya-horizontal.png"
          alt="PDUL YA"
          width={960}
          height={362}
          className="h-10 w-auto self-start lg:self-auto"
        />

        <nav aria-label="Secciones del portal">
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
            className="h-11 w-auto"
          />
          <div className="text-sm leading-snug">
            <p className="font-display font-bold text-noche">Yanys Agüero · Alcalde</p>
            <p className="text-tinta/75">Iribarren para la Vida · Gente que Resuelve</p>
          </div>
        </div>
      </div>

      <div className="border-t border-linea">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <address className="inline-flex items-center gap-1.5 not-italic">
              <MapPin size={16} aria-hidden="true" className="shrink-0 text-rojo" />
              Palacio Municipal, Barquisimeto, Lara
            </address>
            <a
              href="https://www.instagram.com/alcaldiairibarren/"
              rel="noopener noreferrer"
              target="_blank"
              className={`inline-flex items-center gap-1.5 ${enlace}`}
            >
              <Instagram size={16} className="text-rojo" />
              @alcaldiairibarren
            </a>
          </div>
          <ul aria-label="Marco legal" className="flex flex-wrap gap-x-5 gap-y-2 text-tinta/80">
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
        <p className="mx-auto max-w-7xl px-4 py-3 text-xs leading-relaxed sm:px-6 sm:text-sm lg:px-8">
          PDUL YA es exclusivo del Plan de Desarrollo Urbano Local. Los permisos y trámites urbanos
          se gestionan en la Dirección de Planificación y Control Urbano (DPCU).
        </p>
      </div>
    </footer>
  );
}
