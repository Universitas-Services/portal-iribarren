import type { FiltrosNoticias } from "@/lib/api/types";
import { formatoAUrl } from "@/lib/validation/schemas";

/** URL del listado de noticias que conserva los filtros y cambia solo la página. */
export function urlPaginaNoticias(f: FiltrosNoticias, pagina: number) {
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
