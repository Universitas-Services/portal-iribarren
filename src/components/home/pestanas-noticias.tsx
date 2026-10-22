"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { RailControls } from "./rail-controls";

export type PestanaNoticias = { id: string; etiqueta: string; contenido: ReactNode };

/**
 * Pestañas del carril de noticias del inicio (Recientes, Más vistas, Más valoradas), con el
 * patrón de pestañas de WAI-ARIA: flechas para cambiar y una sola pestaña en el orden del Tab.
 */
export function PestanasNoticias({ pestanas }: { pestanas: PestanaNoticias[] }) {
  const [activa, setActiva] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const actual = pestanas[activa]!;

  const teclado = (e: KeyboardEvent) => {
    const paso = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    const destino =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? pestanas.length - 1
          : paso
            ? (activa + paso + pestanas.length) % pestanas.length
            : -1;
    if (destino < 0) return;
    e.preventDefault();
    setActiva(destino);
    refs.current[destino]?.focus();
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Ordenar noticias"
          className="flex gap-1 rounded-full bg-papel p-1 shadow-tarjeta"
        >
          {pestanas.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${p.id}`}
              aria-selected={i === activa}
              aria-controls={`${base}-panel-${p.id}`}
              tabIndex={i === activa ? 0 : -1}
              onClick={() => setActiva(i)}
              onKeyDown={teclado}
              className="min-h-10 rounded-full px-4 font-display text-sm font-bold text-tinta transition-colors duration-150 hover:text-rojo aria-selected:bg-morado-activo aria-selected:text-papel"
            >
              {p.etiqueta}
            </button>
          ))}
        </div>
        <RailControls targetId={`${base}-carril-${actual.id}`} />
      </div>

      {pestanas.map((p, i) => (
        <div
          key={p.id}
          role="tabpanel"
          id={`${base}-panel-${p.id}`}
          aria-labelledby={`${base}-tab-${p.id}`}
          hidden={i !== activa}
        >
          <ul
            id={`${base}-carril-${p.id}`}
            className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-5 overflow-x-auto px-4 pt-2 pb-8 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            {p.contenido}
          </ul>
        </div>
      ))}
    </>
  );
}
