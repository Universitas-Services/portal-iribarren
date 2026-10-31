"use client";

import { FolderOpen, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTransicionListado } from "@/components/listado/transicion";
import {
  type DocCategory,
  type DocEstado,
  type FiltrosDocumentos,
  type PaginaDocumentos,
} from "@/lib/api/types";
import { urlDocumentos } from "./urls";

type Valores = { q: string; categoria: DocCategory | ""; estado: DocEstado | "" };

const ESTADOS: {
  valor: DocEstado | "";
  label: string;
  clave: keyof PaginaDocumentos["porEstado"];
}[] = [
  { valor: "", label: "Todos", clave: "TODOS" },
  { valor: "OFICIAL", label: "Oficiales", clave: "OFICIAL" },
  { valor: "BORRADOR", label: "Borradores", clave: "BORRADOR" },
];

const titulo = "font-display text-xs font-bold tracking-wide text-tinta/75 uppercase";

/**
 * Panel de filtros del repositorio. En escritorio es una columna fija; en teléfono se pliega
 * en un <details>. Sin JavaScript funciona como formulario GET: cada opción es un botón de envío.
 */
export function FiltrosDocumentos({
  filtros,
  categorias: lista,
  porCategoria,
  porEstado,
}: {
  filtros: FiltrosDocumentos;
  /** Las categorías vigentes de la alcaldía, en su orden. */
  categorias: string[];
  porCategoria: PaginaDocumentos["porCategoria"];
  porEstado: PaginaDocumentos["porEstado"];
}) {
  const router = useRouter();
  const { iniciar } = useTransicionListado();
  const deUrl: Valores = {
    q: filtros.q ?? "",
    categoria: filtros.categoria ?? "",
    estado: filtros.estado ?? "",
  };
  const [valores, setValores] = useState(deUrl);
  const [escribiendo, setEscribiendo] = useState(false);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Si la URL cambia por fuera («Limpiar filtros», paginación), el panel se pone al día.
  const [ultimaUrl, setUltimaUrl] = useState(deUrl);
  if (JSON.stringify(deUrl) !== JSON.stringify(ultimaUrl)) {
    setUltimaUrl(deUrl);
    if (!escribiendo) setValores(deUrl);
  }
  useEffect(() => () => clearTimeout(espera.current), []);

  const navegar = (v: Valores) => {
    clearTimeout(espera.current);
    setEscribiendo(false);
    iniciar(() =>
      router.replace(
        urlDocumentos({
          q: v.q || undefined,
          categoria: v.categoria || undefined,
          estado: v.estado || undefined,
        }),
        { scroll: false },
      ),
    );
  };

  const cambiar = (parcial: Partial<Valores>, demorar = false) => {
    const v = { ...valores, ...parcial };
    setValores(v);
    if (!demorar) return navegar(v);
    setEscribiendo(true);
    clearTimeout(espera.current);
    espera.current = setTimeout(() => navegar(v), 300);
  };

  const activos = [valores.q, valores.categoria, valores.estado].filter(Boolean).length;
  const categorias: { c: DocCategory | ""; label: string; n: number }[] = [
    { c: "", label: "Todas", n: porCategoria.TODAS },
    ...lista.map((c) => ({ c, label: c, n: porCategoria[c] ?? 0 })),
  ];

  // En escritorio el panel siempre está abierto: el CSS lo fuerza donde hay ::details-content
  // y esto cubre a los navegadores que aún no lo soportan.
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches && panel.current) {
      panel.current.open = true;
    }
  }, []);

  const opcion = (activa: boolean, vacia = false) =>
    `flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm transition-colors ${
      activa
        ? "bg-noche font-semibold text-papel"
        : vacia
          ? "text-tinta/75 hover:bg-superficie"
          : "text-tinta hover:bg-superficie"
    }`;
  const conteo = (activa: boolean) =>
    `rounded-full px-2 py-0.5 text-xs font-semibold ${activa ? "bg-papel/15" : "bg-superficie text-tinta/80"}`;

  return (
    <details
      ref={panel}
      className="group rounded-tarjeta bg-tarjeta shadow-tarjeta lg:[&::details-content]:block lg:[&::details-content]:[content-visibility:visible]"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 font-display font-bold text-fuerte lg:hidden [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={18} aria-hidden="true" className="text-enlace" />
          Filtrar documentos
        </span>
        {activos > 0 && (
          <span className="rounded-full bg-rojo px-2.5 py-0.5 text-xs text-papel">
            {activos} {activos === 1 ? "activo" : "activos"}
          </span>
        )}
      </summary>

      <form
        id="filtros-documentos"
        action="/documentos"
        method="get"
        role="search"
        aria-label="Filtrar documentos"
        onSubmit={(e) => {
          e.preventDefault();
          navegar(valores);
        }}
        className="space-y-6 border-t border-linea p-5 lg:border-t-0"
      >
        <div>
          <label htmlFor="doc-q" className={titulo}>
            Buscar
          </label>
          <div className="relative mt-2">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta/60"
            />
            <input
              id="doc-q"
              name="q"
              type="search"
              maxLength={100}
              autoComplete="off"
              placeholder="Título o tema"
              value={valores.q}
              onChange={(e) => cambiar({ q: e.target.value }, true)}
              className="h-12 w-full rounded-xl border border-linea bg-tarjeta pr-3 pl-10 text-fuerte outline-none placeholder:text-tinta/70 focus-visible:border-rojo"
            />
          </div>
        </div>

        <fieldset>
          <legend className={titulo}>Estado</legend>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-superficie p-1">
            {ESTADOS.map(({ valor, label, clave }) => {
              const activa = valores.estado === valor;
              return (
                <button
                  key={clave}
                  type="submit"
                  name="estado"
                  value={valor === "OFICIAL" ? "oficial" : valor === "BORRADOR" ? "borrador" : ""}
                  aria-pressed={activa}
                  onClick={(e) => {
                    e.preventDefault();
                    cambiar({ estado: valor });
                  }}
                  className={`flex min-h-12 flex-col items-center justify-center rounded-lg px-1 font-display text-xs leading-tight font-bold transition-colors ${
                    activa
                      ? "bg-tarjeta text-fuerte shadow-tarjeta"
                      : "text-tinta/80 hover:text-fuerte"
                  }`}
                >
                  {label}
                  <span className="font-normal tabular-nums">{porEstado[clave]}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={titulo}>Categoría</legend>
          <ul className="mt-2 space-y-1">
            {categorias.map(({ c, label, n }) => {
              const activa = valores.categoria === c;
              return (
                <li key={label}>
                  <button
                    type="submit"
                    name="categoria"
                    value={c}
                    aria-pressed={activa}
                    onClick={(e) => {
                      e.preventDefault();
                      cambiar({ categoria: c });
                    }}
                    className={opcion(activa, n === 0)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FolderOpen
                        size={16}
                        aria-hidden="true"
                        className={activa ? "text-naranja" : "text-tinta/50"}
                      />
                      {label}
                    </span>
                    <span className={conteo(activa)}>{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {activos > 0 && (
          <button
            type="button"
            onClick={() => cambiar({ q: "", categoria: "", estado: "" })}
            className="text-sm font-semibold text-enlace underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </form>
    </details>
  );
}
