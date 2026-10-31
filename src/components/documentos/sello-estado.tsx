import { BadgeCheck, PencilLine } from "lucide-react";
import type { DocEstado } from "@/lib/api/types";

export const ESTADO_DOC: Record<DocEstado, { label: string; corto: string; clase: string }> = {
  OFICIAL: {
    label: "Documento oficializado",
    corto: "Oficial",
    clase: "bg-exito/10 text-exito-oscuro ring-exito/30",
  },
  BORRADOR: {
    label: "Borrador de trabajo",
    corto: "Borrador",
    clase: "bg-amarillo/25 text-fuerte ring-amarillo/60",
  },
};

/** Sello del estado administrativo: verde para oficial, amarillo para borrador. */
export function SelloEstado({
  estado,
  corto = false,
  className = "",
}: {
  estado: DocEstado;
  corto?: boolean;
  className?: string;
}) {
  const e = ESTADO_DOC[estado];
  const Icon = estado === "OFICIAL" ? BadgeCheck : PencilLine;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-xs font-bold ring-1 ring-inset ${e.clase} ${className}`}
    >
      <Icon size={14} aria-hidden="true" />
      {corto ? e.corto : e.label}
    </span>
  );
}
