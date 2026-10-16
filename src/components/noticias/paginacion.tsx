import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FiltrosNoticias } from "@/lib/api/types";
import { formatoAUrl } from "@/lib/validation/schemas";

/** URL del listado que conserva los filtros y cambia solo la página. */
export function urlPagina(f: FiltrosNoticias, pagina: number) {
  const qs = new URLSearchParams();
  if (f.q) qs.set("q", f.q);
  if (f.categoria) qs.set("categoria", f.categoria);
  if (f.formato) qs.set("formato", formatoAUrl(f.formato));
  if (f.desde) qs.set("desde", f.desde);
  if (f.hasta) qs.set("hasta", f.hasta);
  if (pagina > 1) qs.set("pagina", String(pagina));
  const s = qs.toString();
  return s ? `/noticias?${s}` : "/noticias";
}

/** Números visibles: primera, última y las vecinas de la actual, con «…» en los saltos. */
function numeros(actual: number, total: number): (number | "…")[] {
  const set = new Set([1, total, actual - 1, actual, actual + 1]);
  const lista = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return lista.flatMap((n, i) => (i > 0 && n - lista[i - 1]! > 1 ? ["…" as const, n] : [n]));
}

export function Paginacion({
  filtros,
  pagina,
  paginas,
}: {
  filtros: FiltrosNoticias;
  pagina: number;
  paginas: number;
}) {
  if (paginas <= 1) return null;
  const boton =
    "grid min-h-11 min-w-11 place-items-center rounded-xl px-3 font-display font-bold transition-colors";

  return (
    <nav aria-label="Paginación de noticias" className="mt-12 flex flex-col items-center gap-4">
      <p className="text-sm text-tinta/75">
        Página {pagina} de {paginas}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {pagina > 1 ? (
            <Link
              href={urlPagina(filtros, pagina - 1)}
              className={`${boton} bg-papel text-noche shadow-tarjeta hover:text-rojo`}
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
            <li key={`salto-${i}`} aria-hidden="true" className="px-1 text-tinta/60">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={urlPagina(filtros, n)}
                aria-current={n === pagina ? "page" : undefined}
                className={`${boton} ${
                  n === pagina
                    ? "bg-rojo text-papel"
                    : "bg-papel text-noche shadow-tarjeta hover:text-rojo"
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
              href={urlPagina(filtros, pagina + 1)}
              className={`${boton} bg-papel text-noche shadow-tarjeta hover:text-rojo`}
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
