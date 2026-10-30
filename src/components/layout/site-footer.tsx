import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Instagram } from "@/components/icons";
import { getSitio } from "@/lib/api";
import type { Red } from "@/lib/sitio";
import { CintaMarcas } from "./cinta-marcas";

/** Instagram tiene su ícono de marca; las demás redes, uno genérico. */
const IconoRed = ({ red }: { red: Red }) =>
  red === "INSTAGRAM" ? (
    <Instagram size={14} className="text-rojo" />
  ) : (
    <AtSign size={14} aria-hidden="true" className="text-rojo" />
  );

const enlace = "transition-colors duration-150 hover:text-rojo hover:underline";

/**
 * Footer claro y compacto (los logos de la Alcaldía no se leen sobre fondos oscuros): una cinta
 * con PDUL YA, el alcalde, los lemas de la gestión y la Alcaldía. La navegación vive solo en el
 * encabezado.
 */
export async function SiteFooter() {
  // Dirección, contacto, redes y enlaces oficiales: los edita la alcaldía (R17).
  const { contacto, redes, enlaces } = await getSitio();
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
              {contacto.direccion}
            </address>
            {contacto.correo && (
              <a
                href={`mailto:${contacto.correo}`}
                className={`inline-flex items-center gap-1.5 ${enlace}`}
              >
                <Mail size={14} aria-hidden="true" className="text-rojo" />
                {contacto.correo}
              </a>
            )}
            {contacto.telefono && (
              <a
                href={`tel:${contacto.telefono.replace(/[^\d+]/g, "")}`}
                className={`inline-flex items-center gap-1.5 ${enlace}`}
              >
                <Phone size={14} aria-hidden="true" className="text-rojo" />
                {contacto.telefono}
              </a>
            )}
            {redes.map((r) => (
              <a
                key={r.url}
                href={r.url}
                rel="noopener noreferrer"
                target="_blank"
                className={`inline-flex items-center gap-1.5 ${enlace}`}
              >
                <IconoRed red={r.red} />
                {r.usuario}
              </a>
            ))}
          </div>
          <ul
            aria-label="Marco legal"
            className="flex flex-wrap gap-x-4 gap-y-1.5 text-tinta/80 sm:gap-x-5"
          >
            {enlaces.map((l) => (
              <li key={`${l.texto}-${l.url}`}>
                {l.url.startsWith("/") ? (
                  <Link href={l.url} className={enlace}>
                    {l.texto}
                  </Link>
                ) : (
                  <a href={l.url} rel="noopener noreferrer" target="_blank" className={enlace}>
                    {l.texto}
                  </a>
                )}
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
