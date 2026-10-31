"use client";

import { FileClock } from "lucide-react";
import Link from "next/link";
import {
  RUTA_TEXTO_LEGAL,
  TITULO_TEXTO_LEGAL,
  type TextoLegal,
  type TipoTextoLegal,
} from "@/lib/api/types";
import { formatearFecha } from "@/lib/formato";
import { Dialogo } from "./piezas";

/** «Versión X · publicada el …». */
export function DatosVersion({ texto }: { texto: TextoLegal }) {
  return (
    <>
      Versión {texto.version} · publicada el {formatearFecha(texto.publicadoEl)}
    </>
  );
}

/** El cuerpo de un texto legal, con el aviso si todavía es provisional. */
export function CuerpoTextoLegal({ texto }: { texto: TextoLegal }) {
  return (
    <>
      {texto.provisional && (
        <p className="mb-5 flex items-start gap-3 rounded-2xl bg-amarillo/15 p-4 text-sm leading-relaxed text-fuerte ring-1 ring-amarillo/60 ring-inset">
          <FileClock size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          El texto definitivo está en preparación por el equipo de documentación y pasará por
          revisión legal antes de publicarse.
        </p>
      )}
      {/* El HTML llega saneado desde src/lib/api (getTextoLegal). */}
      <div className="prosa" dangerouslySetInnerHTML={{ __html: texto.html }} />
    </>
  );
}

/**
 * El texto legal en un modal, para leerlo sin salir del formulario. `texto` null (la API no lo
 * pudo dar): solo queda el enlace a la página.
 */
export function ModalTextoLegal({
  tipo,
  texto,
  abierto,
  onCerrar,
}: {
  tipo: TipoTextoLegal;
  texto: TextoLegal | null;
  abierto: boolean;
  onCerrar: () => void;
}) {
  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={TITULO_TEXTO_LEGAL[tipo]}
      subtitulo={texto && <DatosVersion texto={texto} />}
      largo
      pie={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={RUTA_TEXTO_LEGAL[tipo]}
            target="_blank"
            rel="noopener"
            className="text-sm font-semibold text-enlace underline underline-offset-2"
          >
            Abrir en otra pestaña<span className="sr-only"> (se abre en otra pestaña)</span>
          </Link>
          <button
            type="button"
            autoFocus
            onClick={onCerrar}
            className="inline-flex min-h-11 items-center rounded-xl bg-rojo px-5 font-display font-bold text-papel transition-colors hover:bg-rojo-oscuro"
          >
            Entendido
          </button>
        </div>
      }
    >
      {texto ? (
        <CuerpoTextoLegal texto={texto} />
      ) : (
        <p className="leading-relaxed text-tinta">
          No pudimos cargar el texto en este momento. Puedes leerlo en su página.
        </p>
      )}
    </Dialogo>
  );
}
