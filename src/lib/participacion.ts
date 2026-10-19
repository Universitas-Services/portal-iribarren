import type { EstadoParticipacion } from "@/lib/api/types";

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
