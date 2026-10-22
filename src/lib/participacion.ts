import type { EstadoParticipacion, TipoParticipacion } from "@/lib/api/types";

/**
 * Solo la propuesta formal tiene seguimiento (pendiente, en revisión, verificada, rechazada,
 * publicada). Las opiniones, general o sobre una noticia, se reciben y quedan en PENDIENTE, que
 * el portal muestra como «Recibida» (decisión del cliente, 22-10-2026).
 */
export const tieneSeguimiento = (tipo: TipoParticipacion) => tipo === "PROPUESTA_FORMAL";

/** Cómo se lee cada estado de una participación (v3, 5.1) y su color de insignia. */
export const ESTADO_PARTICIPACION: Record<
  EstadoParticipacion,
  { texto: string; ayuda: string; clase: string }
> = {
  PENDIENTE: {
    texto: "Pendiente",
    ayuda: "Recibida; espera que un revisor la tome.",
    clase: "bg-superficie text-noche ring-linea",
  },
  EN_REVISION: {
    texto: "En revisión",
    ayuda: "Un revisor la está evaluando.",
    clase: "bg-amarillo/20 text-noche ring-amarillo/60",
  },
  APROBADA: {
    texto: "Verificada",
    ayuda: "El equipo la verificó; se incorpora como insumo del plan.",
    clase: "bg-exito/10 text-exito-oscuro ring-exito/30",
  },
  RECHAZADA: {
    texto: "Rechazada",
    ayuda: "No se incorpora; el revisor explica el motivo.",
    clase: "bg-rojo/8 text-rojo ring-rojo/30",
  },
  PUBLICADA: {
    texto: "Publicada",
    ayuda: "Verificada y visible en Propuestas publicadas.",
    clase: "bg-noche text-papel ring-noche",
  },
};

/** Las opiniones no tienen seguimiento: se muestran siempre como «Recibida». */
export const RECIBIDA = {
  texto: "Recibida",
  ayuda: "La opinión llegó al equipo del PDUL y se toma en cuenta en el plan.",
  clase: "bg-superficie text-noche ring-linea",
};
