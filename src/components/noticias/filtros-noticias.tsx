"use client";

import {
  Clapperboard,
  FileText,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Search,
  Tag,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FiltrosNoticias, PaginaNoticias, PostCategory } from "@/lib/api/types";
import { formatoAUrl } from "@/lib/validation/schemas";
import { SelectorFechas, textoRango } from "@/components/listado/selector-fechas";
import { useTransicionListado } from "@/components/listado/transicion";
import { Selector } from "@/components/ui/selector";

type Valores = { q: string; categoria: string; formato: string; desde: string; hasta: string };

const desdeFiltros = (f: FiltrosNoticias): Valores => ({
  q: f.q ?? "",
  categoria: f.categoria ?? "",
  formato: f.formato ? formatoAUrl(f.formato) : "",
  desde: f.desde ?? "",
  hasta: f.hasta ?? "",
});

/** Arma la URL sin parámetros vacíos; cambiar un filtro vuelve a la página 1. */
export function urlNoticias(v: Partial<Valores>) {
  const qs = new URLSearchParams();
  for (const [k, val] of Object.entries(v)) if (val) qs.set(k, val);
  const s = qs.toString();
  return s ? `/noticias?${s}` : "/noticias";
}

/** Pestañas de formato: el valor es el que va en la URL (?formato=galeria). */
const PESTANAS: {
  valor: string;
  clave: keyof PaginaNoticias["porFormato"];
  label: string;
  Icon: LucideIcon;
}[] = [
  { valor: "", clave: "TODOS", label: "Todo", Icon: LayoutGrid },
  { valor: "imagen", clave: "IMAGEN", label: "Fotos", Icon: ImageIcon },
  { valor: "galeria", clave: "GALERIA", label: "Galerías", Icon: Images },
  { valor: "video", clave: "VIDEO", label: "Videos", Icon: Clapperboard },
  { valor: "documento", clave: "DOCUMENTO", label: "Documentos", Icon: FileText },
  { valor: "texto", clave: "TEXTO", label: "Textos", Icon: Type },
];

const campo =
  "h-12 w-full rounded-xl border border-linea bg-papel px-4 text-noche transition-colors outline-none focus-visible:border-rojo";
const etiqueta = "mb-1.5 block font-display text-sm font-bold text-noche";

/**
 * Filtros del listado. Sin JavaScript funcionan como un formulario GET normal; con JavaScript
 * actualizan la URL al momento (la búsqueda espera 300 ms tras la última tecla).
 */
export function FiltrosNoticias({
  filtros,
  categorias,
  porFormato,
}: {
  filtros: FiltrosNoticias;
  categorias: readonly PostCategory[];
  porFormato: PaginaNoticias["porFormato"];
}) {
  const router = useRouter();
  const { iniciar } = useTransicionListado();
  const [valores, setValores] = useState(() => desdeFiltros(filtros));
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [escribiendo, setEscribiendo] = useState(false);

  // Si la URL cambia por fuera (paginación, «Limpiar filtros»), los campos se ponen al día,
  // salvo mientras la persona está escribiendo.
  const deUrl = desdeFiltros(filtros);
  const [ultimaUrl, setUltimaUrl] = useState(deUrl);
  if (JSON.stringify(deUrl) !== JSON.stringify(ultimaUrl)) {
    setUltimaUrl(deUrl);
    if (!escribiendo) setValores(deUrl);
  }

  useEffect(() => () => clearTimeout(espera.current), []);

  const navegar = (v: Valores) => {
    clearTimeout(espera.current);
    setEscribiendo(false);
    iniciar(() => router.replace(urlNoticias(v), { scroll: false }));
  };

  const cambiar = (parcial: Partial<Valores>, demorar = false) => {
    const v = { ...valores, ...parcial };
    setValores(v);
    if (demorar) {
      setEscribiendo(true);
      clearTimeout(espera.current);
      espera.current = setTimeout(() => navegar(v), 300);
    } else {
      navegar(v);
    }
  };

  const activos = [
    valores.q && { clave: "q" as const, texto: `«${valores.q}»` },
    valores.categoria && { clave: "categoria" as const, texto: valores.categoria },
    (valores.desde || valores.hasta) && {
      clave: "fecha" as const,
      texto: textoRango(valores.desde, valores.hasta),
    },
  ].filter((a) => !!a);

  return (
    <>
      <form
        id="filtros-noticias"
        action="/noticias"
        method="get"
        role="search"
        aria-label="Filtrar noticias"
        onSubmit={(e) => {
          e.preventDefault();
          navegar(valores);
        }}
        className="rounded-tarjeta bg-papel p-5 shadow-tarjeta sm:p-6"
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[2fr_1.2fr_1.6fr]">
          <div className="col-span-2 lg:col-span-1">
            <label htmlFor="filtro-q" className={etiqueta}>
              Buscar
            </label>
            <div className="relative">
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-tinta/60"
              />
              <input
                id="filtro-q"
                name="q"
                type="search"
                maxLength={100}
                autoComplete="off"
                placeholder="Título o tema"
                value={valores.q}
                onChange={(e) => cambiar({ q: e.target.value }, true)}
                className={`${campo} pl-11`}
              />
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <Selector
              id="filtro-categoria"
              name="categoria"
              etiqueta="Categoría"
              Icono={Tag}
              opciones={categorias}
              valor={valores.categoria}
              onCambio={(categoria) => cambiar({ categoria })}
              vacio="Todas"
              permitirVacio
            />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <SelectorFechas
              desde={valores.desde}
              hasta={valores.hasta}
              onAplicar={(desde, hasta) => cambiar({ desde, hasta })}
            />
            <input type="hidden" name="desde" value={valores.desde} />
            <input type="hidden" name="hasta" value={valores.hasta} />
          </div>
        </div>

        {/* Solo sin JavaScript: campos de fecha nativos y botón para aplicar los filtros. */}
        <noscript>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className={etiqueta}>
              Desde
              <input name="desde" type="date" defaultValue={valores.desde} className={campo} />
            </label>
            <label className={etiqueta}>
              Hasta
              <input name="hasta" type="date" defaultValue={valores.hasta} className={campo} />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 h-12 rounded-xl bg-rojo px-6 font-display font-bold text-papel"
          >
            Aplicar filtros
          </button>
        </noscript>

        {activos.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-linea pt-4">
            <span className="text-sm text-tinta/75">Filtros activos:</span>
            {activos.map((a) => (
              <button
                key={a.clave}
                type="button"
                onClick={() =>
                  cambiar(a.clave === "fecha" ? { desde: "", hasta: "" } : { [a.clave]: "" })
                }
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-rojo/10 px-3 font-display text-sm font-bold text-rojo transition-colors hover:bg-rojo/15"
              >
                {a.texto}
                <X size={14} aria-hidden="true" />
                <span className="sr-only">(quitar filtro)</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => cambiar({ q: "", categoria: "", formato: "", desde: "", hasta: "" })}
              className="min-h-9 px-2 text-sm font-semibold text-tinta underline-offset-4 hover:text-rojo hover:underline"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </form>

      {/*
       * Pestañas de formato. Son botones de envío del formulario: sin JavaScript mandan
       * ?formato=…; con JavaScript cambian la URL al instante.
       */}
      <div
        role="group"
        aria-label="Mostrar por formato"
        className="-mx-4 mt-6 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {PESTANAS.map(({ valor, clave, label, Icon }) => {
          const activa = valores.formato === valor;
          const n = porFormato[clave];
          return (
            <button
              key={clave}
              type="submit"
              form="filtros-noticias"
              name="formato"
              value={valor}
              aria-pressed={activa}
              onClick={(e) => {
                e.preventDefault();
                cambiar({ formato: valor });
              }}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-display text-sm font-bold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.96] ${
                activa
                  ? "border-noche bg-noche text-papel"
                  : "border-linea bg-papel text-noche hover:border-noche/40"
              } ${n === 0 && !activa ? "opacity-50" : ""}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${activa ? "bg-papel/15" : "bg-superficie text-tinta/80"}`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
