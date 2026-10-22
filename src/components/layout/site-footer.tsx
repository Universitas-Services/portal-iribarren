import { MapPin } from "lucide-react";
import Link from "next/link";
import { Instagram } from "@/components/icons";
import { CintaMarcas } from "./cinta-marcas";

const MARCO_LEGAL = [
  // Enlaces oficiales pendientes de confirmar con el cliente.
  { href: "/conoce-el-pdul#marco-legal", label: "Decreto 48-2026" },
  { href: "/conoce-el-pdul#marco-legal", label: "LOOU" },
  { href: "/conoce-el-pdul#marco-legal", label: "Sentencia N° 928/2018 del TSJ" },
];

const enlace = "transition-colors duration-150 hover:text-rojo hover:underline";

/**
 * Footer claro y compacto (los logos de la Alcaldía no se leen sobre fondos oscuros): una cinta
 * con PDUL YA, el alcalde, los lemas de la gestión y la Alcaldía. La navegación vive solo en el
 * encabezado.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-linea bg-papel text-tinta print:hidden">
      <div className="py-3 sm:py-4">
        <CintaMarcas />
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
