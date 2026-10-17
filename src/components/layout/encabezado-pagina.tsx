import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Cabecera de las páginas internas: banda oscura con el patrón urbano, migas y título.
 * El contenido de la página se monta encima (margen negativo), como el bento del Inicio.
 */
export function EncabezadoPagina({
  migas,
  titulo,
  bajada,
  children,
  ancho = "max-w-7xl",
}: {
  migas: { href?: string; label: string }[];
  titulo: ReactNode;
  bajada?: ReactNode;
  children?: ReactNode;
  ancho?: string;
}) {
  return (
    <div className="patron-urbano">
      <div className={`mx-auto ${ancho} px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14 lg:pb-32`}>
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-papel/75">
            {migas.map((m, i) => (
              <li key={m.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} aria-hidden="true" className="text-papel/50" />}
                {m.href ? (
                  <Link href={m.href} className="hover:text-papel hover:underline">
                    {m.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-papel">
                    {m.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="cascada">
          {children}
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2rem,4.8vw,3.5rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-papel">
            {titulo}
          </h1>
          {bajada && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-papel/85">{bajada}</p>
          )}
        </div>
      </div>
    </div>
  );
}
