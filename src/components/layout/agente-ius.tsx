"use client";

import { ArrowUpRight, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { EVENTO_TOUR } from "@/components/tour/tour";

/*
 * Agente integrado, en todas las páginas del portal: un botón flotante abre un panel tipo chat donde la asistente de
 * Ius Urbano invita a registrarse en su sitio para consultar dudas de urbanismo. No conversa
 * aquí: solo presenta el servicio. El enlace al sitio externo es la última burbuja del chat.
 */

const SITIO = "https://iusurbano.universitas.legal/";

/** `tour`: la brújula del recorrido guiado, a la izquierda del avatar. */
export function AgenteIus({ tour }: { tour?: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const [escribiendo, setEscribiendo] = useState(true);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  // El recorrido guiado cierra el panel: no deben taparse.
  useEffect(() => {
    const cerrar = () => setAbierto(false);
    window.addEventListener(EVENTO_TOUR, cerrar);
    return () => window.removeEventListener(EVENTO_TOUR, cerrar);
  }, []);

  // Al abrir: un instante de «escribiendo…» y el foco pasa al panel.
  useEffect(() => {
    if (!abierto) return;
    panel.current?.focus();
    const t = setTimeout(() => setEscribiendo(false), 900);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("keydown", tecla);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6 print:hidden">
      {abierto && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-label="Asistente de Ius Urbano"
          tabIndex={-1}
          className="w-[min(22rem,calc(100vw-2rem))] origin-bottom-right animate-[aparecer_240ms_var(--ease-out-expo)] overflow-hidden rounded-tarjeta bg-papel shadow-elevada ring-1 ring-linea outline-none"
        >
          <div className="flex items-center gap-3 bg-noche px-4 py-3 text-papel">
            <Image
              src="/agentes/ius-urbano.webp"
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-full bg-papel object-cover ring-2 ring-papel/30"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold">Ius Urbano</p>
              <p className="text-xs text-papel/75">Agente de consulta en urbanismo</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                boton.current?.focus();
              }}
              aria-label="Cerrar el asistente"
              className="grid size-9 place-items-center rounded-full text-papel/80 transition-colors hover:bg-papel/10 hover:text-papel"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 bg-superficie px-4 py-4" aria-live="polite">
            <div className="flex items-end gap-2">
              <Image
                src="/agentes/ius-urbano.webp"
                alt=""
                width={28}
                height={28}
                className="size-7 shrink-0 rounded-full object-cover"
              />
              {escribiendo ? (
                <p className="rounded-2xl rounded-bl-md bg-papel px-4 py-3 text-sm text-tinta/70 shadow-tarjeta">
                  <span className="sr-only">Escribiendo…</span>
                  <span aria-hidden="true" className="inline-flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-tinta/40" />
                    <span className="size-1.5 animate-bounce rounded-full bg-tinta/40 [animation-delay:120ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-tinta/40 [animation-delay:240ms]" />
                  </span>
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="rounded-2xl rounded-bl-md bg-papel px-4 py-3 text-sm leading-relaxed text-tinta shadow-tarjeta">
                    ¡Hola! Soy la asistente de <strong className="text-noche">Ius Urbano</strong>,
                    entrenada en planificación urbana, ordenanzas y normativa urbanística.
                  </p>
                  <p className="rounded-2xl rounded-bl-md bg-papel px-4 py-3 text-sm leading-relaxed text-tinta shadow-tarjeta">
                    Si tienes dudas sobre el PDUL, los usos del suelo o cómo presentar tu propuesta,
                    regístrate en Ius Urbano y conversa conmigo allí.
                  </p>
                  <a
                    href={SITIO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl rounded-bl-md bg-noche px-4 py-3 text-sm text-papel shadow-tarjeta transition-colors hover:bg-morado-activo"
                  >
                    <span className="flex items-center gap-1.5 font-display font-bold">
                      Ius Urbano
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                    <span className="block text-papel/75">iusurbano.universitas.legal</span>
                    <span className="sr-only"> (se abre en otra pestaña)</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* La brújula: encima del avatar en el teléfono, a su izquierda desde sm. */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {tour}
        <button
          ref={boton}
          type="button"
          onClick={() => {
            if (!abierto) setEscribiendo(true);
            setAbierto((v) => !v);
          }}
          aria-expanded={abierto}
          aria-controls={abierto ? id : undefined}
          aria-label={
            abierto ? "Cerrar el asistente de Ius Urbano" : "Abrir el asistente de Ius Urbano"
          }
          className="group relative size-13 rounded-full bg-papel p-0.5 shadow-elevada ring-1 ring-linea transition-transform duration-200 ease-out-expo hover:-translate-y-0.5 active:scale-95"
        >
          <Image
            src="/agentes/ius-urbano.webp"
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-rojo text-papel ring-2 ring-papel"
          >
            {abierto ? <X size={11} /> : <MessageCircle size={11} />}
          </span>
        </button>
      </div>
    </div>
  );
}
