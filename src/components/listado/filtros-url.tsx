"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Selector, type OpcionSelector } from "@/components/ui/selector";
import { useTransicionListado } from "./transicion";

export type CampoFiltro =
  | {
      tipo: "selector";
      nombre: string;
      etiqueta: string;
      opciones: readonly OpcionSelector[];
      vacio: string;
    }
  | { tipo: "texto"; nombre: string; etiqueta: string; placeholder: string; maxLength?: number };

/**
 * Barra de filtros que vive en la URL (se puede compartir y el botón Atrás funciona). Los
 * selectores aplican al elegir; el texto, al dejar de escribir. Va dentro de <TransicionListado>
 * para que los resultados anteriores sigan visibles mientras llegan los nuevos.
 */
export function FiltrosUrl({
  ruta,
  campos,
  valores: iniciales,
  etiqueta,
  columnas = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  ruta: string;
  campos: CampoFiltro[];
  valores: Record<string, string>;
  /** Nombre del buscador para lectores de pantalla. */
  etiqueta: string;
  columnas?: string;
}) {
  const router = useRouter();
  const { iniciar } = useTransicionListado();
  const [valores, setValores] = useState(iniciales);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(espera.current), []);

  function navegar(v: Record<string, string>) {
    const qs = new URLSearchParams();
    for (const c of campos) {
      const x = v[c.nombre]?.trim();
      if (x) qs.set(c.nombre, x);
    }
    const s = qs.toString();
    iniciar(() => router.replace(s ? `${ruta}?${s}` : ruta, { scroll: false }));
  }

  function cambiar(nombre: string, valor: string, conEspera = false) {
    const v = { ...valores, [nombre]: valor };
    setValores(v);
    clearTimeout(espera.current);
    if (conEspera) espera.current = setTimeout(() => navegar(v), 350);
    else navegar(v);
  }

  const hayFiltros = campos.some((c) => valores[c.nombre]);

  return (
    <form
      role="search"
      aria-label={etiqueta}
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(espera.current);
        navegar(valores);
      }}
      className="rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:p-6"
    >
      <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${columnas}`}>
        {campos.map((c) =>
          c.tipo === "selector" ? (
            <Selector
              key={c.nombre}
              id={`filtro-${c.nombre}`}
              name={c.nombre}
              etiqueta={c.etiqueta}
              opciones={c.opciones}
              vacio={c.vacio}
              permitirVacio
              valor={valores[c.nombre] ?? ""}
              onCambio={(v) => cambiar(c.nombre, v)}
            />
          ) : (
            <div key={c.nombre}>
              <label
                htmlFor={`filtro-${c.nombre}`}
                className="mb-1.5 block font-display text-sm font-bold text-fuerte"
              >
                {c.etiqueta}
              </label>
              <div className="relative">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-tinta/60"
                />
                <input
                  id={`filtro-${c.nombre}`}
                  name={c.nombre}
                  type="search"
                  autoComplete="off"
                  maxLength={c.maxLength ?? 100}
                  placeholder={c.placeholder}
                  value={valores[c.nombre] ?? ""}
                  onChange={(e) => cambiar(c.nombre, e.target.value, true)}
                  className="h-12 w-full rounded-xl border border-linea bg-tarjeta pr-4 pl-11 text-fuerte transition-colors outline-none placeholder:text-tinta/70 hover:border-fuerte/40 focus-visible:border-rojo"
                />
              </div>
            </div>
          ),
        )}
      </div>
      {hayFiltros && (
        <button
          type="button"
          onClick={() => {
            const vacios = Object.fromEntries(campos.map((c) => [c.nombre, ""]));
            setValores(vacios);
            navegar(vacios);
          }}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-display text-sm font-bold text-enlace hover:bg-rojo/8"
        >
          <X size={16} aria-hidden="true" />
          Quitar filtros
        </button>
      )}
    </form>
  );
}
