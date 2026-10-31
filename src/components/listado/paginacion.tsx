import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

/** Números visibles: primera, última y las vecinas de la actual, con «…» en los saltos. */
function numeros(actual: number, total: number): (number | "…")[] {
  const set = new Set([1, total, actual - 1, actual, actual + 1]);
  const lista = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return lista.flatMap((n, i) => (i > 0 && n - lista[i - 1]! > 1 ? ["…" as const, n] : [n]));
}

/**
 * Paginación accesible para cualquier listado. `href` arma la URL de cada página
 * conservando los filtros del listado.
 */
export function Paginacion({
  pagina,
  paginas,
  href,
  etiqueta,
}: {
  pagina: number;
  paginas: number;
  href: (pagina: number) => string;
  /** Nombre del listado para lectores de pantalla, p. ej. «noticias». */
  etiqueta: string;
}) {
  if (paginas <= 1) return null;
  const boton =
    "grid min-h-11 min-w-11 place-items-center rounded-xl px-3 font-display font-bold transition-colors";

  return (
    <nav
      aria-label={`Paginación de ${etiqueta}`}
      className="mt-12 flex flex-col items-center gap-4"
    >
      <p className="text-sm text-tinta/75">
        Página {pagina} de {paginas}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {pagina > 1 ? (
            <Link
              href={href(pagina - 1)}
              className={`${boton} bg-tarjeta text-fuerte shadow-tarjeta hover:text-enlace`}
            >
              <span className="sr-only">Página anterior</span>
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" className={`${boton} text-tinta/30`}>
              <ArrowLeft size={18} />
            </span>
          )}
        </li>
        {numeros(pagina, paginas).map((n, i) =>
          n === "…" ? (
            <li key={`salto-${i}`} aria-hidden="true" className="px-1 text-tinta/70">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === pagina ? "page" : undefined}
                className={`${boton} ${
                  n === pagina
                    ? "bg-rojo text-papel"
                    : "bg-tarjeta text-fuerte shadow-tarjeta hover:text-enlace"
                }`}
              >
                <span className="sr-only">Página </span>
                {n}
              </Link>
            </li>
          ),
        )}
        <li>
          {pagina < paginas ? (
            <Link
              href={href(pagina + 1)}
              className={`${boton} bg-tarjeta text-fuerte shadow-tarjeta hover:text-enlace`}
            >
              <span className="sr-only">Página siguiente</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" className={`${boton} text-tinta/30`}>
              <ArrowRight size={18} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
