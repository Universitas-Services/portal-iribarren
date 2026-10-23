import type { EstadoParticipacion, TipoParticipacion } from "@/lib/api/types";

/**
 * Toda opinión y propuesta pasa por el Revisor de la alcaldía, que decide si la publica en
 * Propuestas (decisión del cliente, 23-10-2026). Solo la propuesta formal tiene seguimiento con
 * respuesta (en revisión, verificada, rechazada). La opinión, general o sobre una noticia, queda
 * en PENDIENTE —el portal la muestra como «Recibida»— hasta que el Revisor la publica.
 */
export const tieneSeguimiento = (tipo: TipoParticipacion) => tipo === "PROPUESTA_FORMAL";

/** Cambios de estado que el Revisor puede hacer en una opinión: publicarla o despublicarla. */
export const TRANSICIONES_OPINION: Partial<Record<EstadoParticipacion, EstadoParticipacion[]>> = {
  PENDIENTE: ["PUBLICADA"],
  PUBLICADA: ["PENDIENTE"],
};

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

/** Opinión aún no publicada: no tiene más estados que mostrar. */
export const RECIBIDA = {
  texto: "Recibida",
  ayuda: "La opinión llegó al equipo de la alcaldía, que la revisa y puede publicarla.",
  clase: "bg-superficie text-noche ring-linea",
};
