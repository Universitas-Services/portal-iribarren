"use client";

import { useEffect, useState, type MouseEvent } from "react";

export type SeccionIndice = { id: string; label: string };

/**
 * Índice de la página: en escritorio es una columna fija; en teléfono, un carril horizontal
 * pegado bajo el encabezado. Muestra una sección a la vez (la primera por defecto): la elegida
 * queda en la URL (#marco-legal), así se puede enlazar y «Atrás» vuelve a la anterior. Marca la
 * visible con data-visible sobre las secciones de `.secciones-conoce` (el CSS está en
 * globals.css, que antes de cargar este componente usa el #id de la URL).
 */
export function Indice({ secciones }: { secciones: SeccionIndice[] }) {
  const [actual, setActual] = useState(secciones[0]?.id);

  useEffect(() => {
    const leer = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const elegida = secciones.find((s) => s.id === id)?.id ?? secciones[0]?.id;
      if (elegida) mostrar(elegida);
      setActual(elegida);
    };
    leer();
    // «Atrás» y «Adelante», y los enlaces con #id desde la misma página.
    window.addEventListener("hashchange", leer);
    window.addEventListener("popstate", leer);
    return () => {
      window.removeEventListener("hashchange", leer);
      window.removeEventListener("popstate", leer);
    };
  }, [secciones]);

  function elegir(e: MouseEvent<HTMLAnchorElement>, id: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (id !== actual) history.pushState(null, "", `#${id}`);
    mostrar(id);
    setActual(id);
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: quieto ? "auto" : "smooth" });
    // El foco va al título de la sección, para el lector de pantalla y el teclado.
    document.getElementById(`${id}-titulo`)?.focus({ preventScroll: true });
  }

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
                onClick={(e) => elegir(e, s.id)}
                aria-current={activa ? "location" : undefined}
                className={`flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors lg:rounded-lg lg:px-2 lg:py-1.5 ${
                  activa
                    ? "bg-noche text-papel lg:bg-transparent lg:text-enlace"
                    : "bg-tarjeta text-tinta shadow-tarjeta hover:text-enlace lg:bg-transparent lg:shadow-none"
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

/** Deja visible solo la sección `id` dentro de `.secciones-conoce`. */
function mostrar(id: string) {
  const contenedor = document.querySelector<HTMLElement>(".secciones-conoce");
  if (!contenedor) return;
  contenedor.dataset.activa = id;
  for (const s of contenedor.querySelectorAll<HTMLElement>("[data-seccion]"))
    s.toggleAttribute("data-visible", s.id === id);
}
