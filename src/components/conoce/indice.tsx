"use client";

import { useEffect, useState } from "react";

export type SeccionIndice = { id: string; label: string };

/**
 * Índice de la página: en escritorio es una columna fija que marca la sección que se está
 * leyendo; en teléfono es un carril horizontal pegado bajo el encabezado.
 */
export function Indice({ secciones }: { secciones: SeccionIndice[] }) {
  const [actual, setActual] = useState(secciones[0]?.id);

  useEffect(() => {
    const visibles = new Map<string, boolean>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) visibles.set(e.target.id, e.isIntersecting);
        // La primera sección visible (en orden de la página) es la que se está leyendo.
        const primera = secciones.find((s) => visibles.get(s.id));
        if (primera) setActual(primera.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const s of secciones) {
      const el = document.getElementById(s.id);
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, [secciones]);

  return (
    <nav aria-label="En esta página">
      <p className="hidden font-display text-xs font-bold tracking-wide text-tinta/75 uppercase lg:block">
        En esta página
      </p>
      <ol className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-3 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {secciones.map((s) => {
          const activa = s.id === actual;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={activa ? "location" : undefined}
                className={`flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors lg:rounded-lg lg:px-2 lg:py-1.5 ${
                  activa
                    ? "bg-noche text-papel lg:bg-transparent lg:text-rojo"
                    : "bg-papel text-tinta shadow-tarjeta hover:text-rojo lg:bg-transparent lg:shadow-none"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`hidden size-1.5 shrink-0 rounded-full transition-[background-color,transform] duration-200 lg:block ${
                    activa ? "scale-150 bg-rojo" : "bg-linea"
                  }`}
                />
                {s.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
