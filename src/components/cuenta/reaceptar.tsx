"use client";

import { Loader2, LogOut, ScrollText } from "lucide-react";
import { useState, useTransition } from "react";
import { aceptarTextosLegalesAccion, cerrarSesionAccion } from "@/lib/auth/acciones";
import { TITULO_TEXTO_LEGAL, type TextoLegal } from "@/lib/api/types";
import { Dialogo } from "./piezas";
import { CuerpoTextoLegal, DatosVersion } from "./texto-legal";

const NOMBRE = {
  TERMINOS: "los términos de uso",
  POLITICA_DATOS: "la política de tratamiento de datos personales",
} as const;

/**
 * Se publicó una versión nueva de los términos o de la política de datos: la cuenta no se puede
 * usar hasta aceptarla. El modal no se cierra con Escape ni con el fondo; la alternativa es
 * cerrar la sesión (el portal público sigue a la vista sin ella).
 */
export function ModalReaceptar({ pendientes }: { pendientes: TextoLegal[] }) {
  const [leido, setLeido] = useState(false);
  const [abierto, setAbierto] = useState(pendientes[0]?.tipo);
  const [error, setError] = useState<string>();
  const [enviando, iniciar] = useTransition();
  const varios = pendientes.length > 1;

  return (
    <Dialogo
      abierto
      onCerrar={() => {}}
      bloqueante
      largo
      titulo={
        varios
          ? "Actualizamos los términos de uso y la política de datos"
          : `Actualizamos ${NOMBRE[pendientes[0]!.tipo]}`
      }
      subtitulo="Para seguir usando tu cuenta, lee los cambios y acéptalos."
      pie={
        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 text-tinta">
            <input
              type="checkbox"
              // El foco empieza aquí (no en el texto con scroll): es lo que la persona debe hacer.
              autoFocus
              checked={leido}
              onChange={(e) => setLeido(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-rojo"
            />
            <span className="leading-relaxed">
              Leí y acepto{" "}
              {pendientes.map((t) => `${NOMBRE[t.tipo]} (versión ${t.version})`).join(" y ")}.
            </span>
          </label>
          {error && (
            <p role="alert" className="text-sm font-semibold text-enlace">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 font-display font-semibold text-fuerte ring-1 ring-linea transition-colors hover:bg-superficie sm:w-auto"
              >
                <LogOut size={16} aria-hidden="true" />
                No acepto, cerrar sesión
              </button>
            </form>
            <button
              type="button"
              disabled={!leido || enviando}
              onClick={() =>
                iniciar(async () => {
                  setError(undefined);
                  const r = await aceptarTextosLegalesAccion(
                    Object.fromEntries(pendientes.map((t) => [t.tipo, t.version])),
                  );
                  if (!r.ok) setError(r.mensaje);
                })
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel transition-colors hover:bg-rojo-oscuro disabled:cursor-not-allowed disabled:bg-plata"
            >
              {enviando && <Loader2 size={16} aria-hidden="true" className="animate-spin" />}
              Aceptar y continuar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {pendientes.map((t) => (
          <section
            key={t.tipo}
            aria-labelledby={`reaceptar-${t.tipo}`}
            className="rounded-2xl ring-1 ring-linea"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <h3 id={`reaceptar-${t.tipo}`} className="font-display font-bold text-fuerte">
                  {TITULO_TEXTO_LEGAL[t.tipo]}
                </h3>
                <p className="text-sm text-tinta/80">
                  <DatosVersion texto={t} />
                </p>
              </div>
              {varios && (
                <button
                  type="button"
                  aria-expanded={abierto === t.tipo}
                  onClick={() => setAbierto(abierto === t.tipo ? undefined : t.tipo)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-enlace hover:bg-rojo/5"
                >
                  <ScrollText size={16} aria-hidden="true" />
                  {abierto === t.tipo ? "Ocultar el texto" : "Leer el texto"}
                </button>
              )}
            </div>
            {t.nota && (
              <p className="mx-4 mb-4 rounded-xl bg-superficie p-3 text-sm leading-relaxed text-fuerte">
                <span className="font-semibold">Qué cambió: </span>
                {t.nota}
              </p>
            )}
            {(!varios || abierto === t.tipo) && (
              <div className="border-t border-linea p-4">
                <CuerpoTextoLegal texto={t} />
              </div>
            )}
          </section>
        ))}
      </div>
    </Dialogo>
  );
}
