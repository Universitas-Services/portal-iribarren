import type { FiltrosDocumentos } from "@/lib/api/types";
import { estadoDocAUrl } from "@/lib/validation/schemas";

/** URL del repositorio que conserva los filtros; cambiar un filtro vuelve a la página 1. */
export function urlDocumentos(f: Omit<FiltrosDocumentos, "pagina">, pagina = 1) {
  const qs = new URLSearchParams();
  if (f.q) qs.set("q", f.q);
  if (f.categoria) qs.set("categoria", f.categoria);
  if (f.estado) qs.set("estado", estadoDocAUrl(f.estado));
  if (pagina > 1) qs.set("pagina", String(pagina));
  const s = qs.toString();
  return s ? `/documentos?${s}` : "/documentos";
}
