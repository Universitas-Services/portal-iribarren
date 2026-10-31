"use client";

import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  aplicarTema,
  guardarPreferencia,
  leerPreferencia,
  suscribirTema,
  type PreferenciaTema,
} from "@/lib/tema";

/*
 * Selector del tema: Claro (por defecto), Oscuro o Según el sistema. En escritorio es un botón
 * con menú junto a la cuenta; en el menú móvil, un control de tres opciones.
 */

const OPCIONES: { valor: PreferenciaTema; texto: string; Icon: LucideIcon }[] = [
  { valor: "claro", texto: "Claro", Icon: Sun },
  { valor: "oscuro", texto: "Oscuro", Icon: Moon },
  { valor: "sistema", texto: "Según el sistema", Icon: Monitor },
];

/** La preferencia guardada; en el servidor y al hidratar, «claro» (lo corrige el script). */
function usePreferenciaTema() {
  const preferencia = useSyncExternalStore(suscribirTema, leerPreferencia, () => "claro" as const);
  // En desarrollo, React limpia los atributos de <html> al remontar: se vuelve a poner el tema.
  useLayoutEffect(() => aplicarTema(leerPreferencia()), []);
  return preferencia;
}

/** Escritorio: botón con el ícono del tema y un menú con las tres opciones. */
export function SelectorTema() {
  const preferencia = usePreferenciaTema();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const actual = OPCIONES.find((o) => o.valor === preferencia)!;
  return (
    <div ref={caja} className="relative">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        aria-haspopup="menu"
        onClick={() => setAbierto((v) => !v)}
        className="grid size-10 place-items-center rounded-full text-fuerte transition-colors hover:bg-superficie xl:size-11"
      >
        <actual.Icon size={20} aria-hidden="true" />
        <span className="sr-only">Tema: {actual.texto}. Cambiar tema</span>
      </button>
      {abierto && (
        <div
          id={id}
          role="menu"
          aria-label="Tema"
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-tarjeta p-2 shadow-elevada ring-1 ring-linea"
        >
          {OPCIONES.map((o) => (
            <button
              key={o.valor}
              type="button"
              role="menuitemradio"
              aria-checked={preferencia === o.valor}
              autoFocus={preferencia === o.valor}
              onClick={() => {
                guardarPreferencia(o.valor);
                setAbierto(false);
                boton.current?.focus();
              }}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 font-semibold text-fuerte hover:bg-superficie"
            >
              <o.Icon size={18} aria-hidden="true" className="text-enlace" />
              <span className="flex-1 text-left">{o.texto}</span>
              {preferencia === o.valor && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Menú móvil: las tres opciones a la vista. */
export function SelectorTemaMovil() {
  const preferencia = usePreferenciaTema();
  return (
    <fieldset>
      <legend className="mb-2 font-display text-sm font-bold text-fuerte">Tema</legend>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-superficie p-1 ring-1 ring-linea">
        {OPCIONES.map((o) => (
          <label
            key={o.valor}
            className="flex min-h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-center text-xs font-semibold text-tinta has-[:checked]:bg-tarjeta has-[:checked]:text-fuerte has-[:checked]:shadow-tarjeta has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rojo"
          >
            <input
              type="radio"
              name="tema"
              value={o.valor}
              checked={preferencia === o.valor}
              onChange={() => guardarPreferencia(o.valor)}
              className="sr-only"
            />
            <o.Icon size={18} aria-hidden="true" />
            {o.valor === "sistema" ? "Sistema" : o.texto}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
