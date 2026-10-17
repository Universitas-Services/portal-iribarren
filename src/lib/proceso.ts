import type { EstadoFase } from "@/lib/api/types";

/** Cómo se lee cada estado de fase en el termómetro y en «Conoce el PDUL». */
export const ETIQUETA_FASE: Record<EstadoFase, string> = {
  COMPLETADO: "Completado",
  EN_CURSO: "En curso",
  PENDIENTE: "Pendiente",
  PROXIMAMENTE: "Próximamente",
  FUTURO: "Futuro",
};
