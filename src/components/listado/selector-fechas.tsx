"use client";

import {
  endOfDay,
  format,
  isAfter,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";

/** Fechas en formato de la URL (AAAA-MM-DD). */
const aIso = (d: Date) => format(d, "yyyy-MM-dd");
const deIso = (s?: string) => (s ? parseISO(s) : undefined);

const corta = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short" });
const conAnio = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** «1 sept – 15 oct 2026», «desde 1 sept 2026», «hasta 15 oct 2026» o «Cualquier fecha». */
export function textoRango(desde?: string, hasta?: string) {
  const d = deIso(desde);
  const h = deIso(hasta);
  if (d && h) {
    const mismoAnio = d.getFullYear() === h.getFullYear();
    return `${(mismoAnio ? corta : conAnio).format(d)} – ${conAnio.format(h)}`;
  }
  if (d) return `Desde el ${conAnio.format(d)}`;
  if (h) return `Hasta el ${conAnio.format(h)}`;
  return "Cualquier fecha";
}

/** Dos meses lado a lado desde 640 px; uno en teléfono. */
function useDosMeses() {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia("(min-width: 640px)");
      mq.addEventListener("change", avisar);
      return () => mq.removeEventListener("change", avisar);
    },
    () => window.matchMedia("(min-width: 640px)").matches,
    () => true,
  );
}

type Atajo = { label: string; rango: (hoy: Date) => DateRange };

const ATAJOS: Atajo[] = [
  { label: "Últimos 7 días", rango: (hoy) => ({ from: subDays(hoy, 6), to: hoy }) },
  { label: "Este mes", rango: (hoy) => ({ from: startOfMonth(hoy), to: hoy }) },
  { label: "Últimos 3 meses", rango: (hoy) => ({ from: subMonths(hoy, 3), to: hoy }) },
  { label: "Este año", rango: (hoy) => ({ from: startOfYear(hoy), to: hoy }) },
];

/**
 * Selector de rango de fechas con atajos y calendario en español, con el estilo del portal.
 * En escritorio abre un panel bajo el botón; en teléfono, una hoja desde abajo. Se cierra con
 * Esc o tocando fuera, y el foco vuelve al botón. Solo aplica el rango al pulsar «Aplicar».
 */
export function SelectorFechas({
  desde,
  hasta,
  onAplicar,
  etiqueta = "Fecha",
}: {
  desde?: string;
  hasta?: string;
  onAplicar: (desde: string, hasta: string) => void;
  etiqueta?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [rango, setRango] = useState<DateRange | undefined>();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const idPanel = useId();
  const idEtiqueta = useId();
  const [hoy] = useState(() => endOfDay(new Date()));
  const dosMeses = useDosMeses();

  const abrir = () => {
    setRango(desde || hasta ? { from: deIso(desde), to: deIso(hasta) } : undefined);
    setAbierto(true);
  };
  const cerrar = () => {
    setAbierto(false);
    boton.current?.focus();
  };
  const aplicar = (r: DateRange | undefined) => {
    onAplicar(r?.from ? aIso(r.from) : "", r?.to ? aIso(r.to) : r?.from ? aIso(r.from) : "");
    cerrar();
  };

  // Esc y clic fuera cierran el panel.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    const alTocar = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !boton.current?.contains(t)) setAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("pointerdown", alTocar);
    panel.current?.querySelector<HTMLElement>("[data-atajo]")?.focus();
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("pointerdown", alTocar);
    };
  }, [abierto]);

  const hayRango = Boolean(desde || hasta);
  const mesInicial = rango?.from ?? deIso(desde) ?? subMonths(hoy, 1);

  return (
    <div className="relative">
      <span id={idEtiqueta} className="mb-1.5 block font-display text-sm font-bold text-fuerte">
        {etiqueta}
      </span>
      <button
        ref={boton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-labelledby={`${idEtiqueta} ${idPanel}-valor`}
        onClick={() => (abierto ? cerrar() : abrir())}
        className={`flex h-12 w-full items-center gap-3 rounded-xl border bg-tarjeta px-4 text-left transition-colors outline-none focus-visible:border-rojo ${
          abierto ? "border-rojo" : "border-linea hover:border-fuerte/40"
        }`}
      >
        <CalendarDays size={18} aria-hidden="true" className="shrink-0 text-enlace" />
        <span
          id={`${idPanel}-valor`}
          className={`flex-1 truncate ${hayRango ? "font-semibold text-fuerte" : "text-tinta/70"}`}
        >
          {textoRango(desde, hasta)}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-tinta/60 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <>
          {/* Fondo atenuado solo en teléfono, donde el panel es una hoja inferior. */}
          <div aria-hidden="true" className="fixed inset-0 z-40 bg-noche/40 sm:hidden" />
          <div
            ref={panel}
            id={idPanel}
            role="dialog"
            aria-label="Elegir rango de fechas"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-tarjeta p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-elevada sm:absolute sm:inset-x-auto sm:right-0 sm:bottom-auto sm:mt-2 sm:w-max sm:max-w-[calc(100vw-2rem)] sm:rounded-tarjeta sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between sm:hidden">
              <p className="font-display text-lg font-extrabold text-fuerte">Elegir fechas</p>
              <button
                type="button"
                onClick={cerrar}
                className="grid size-11 place-items-center rounded-full bg-superficie"
              >
                <X size={20} aria-hidden="true" />
                <span className="sr-only">Cerrar</span>
              </button>
            </div>

            <div className="flex flex-col gap-5 md:flex-row">
              <ul
                aria-label="Atajos"
                className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 md:mx-0 md:w-40 md:flex-col md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {ATAJOS.map((a) => (
                  <li key={a.label} className="shrink-0">
                    <button
                      type="button"
                      data-atajo
                      onClick={() => aplicar(a.rango(hoy))}
                      className="min-h-10 w-full rounded-xl bg-superficie px-3.5 text-left text-sm font-semibold whitespace-nowrap text-fuerte transition-colors hover:bg-rojo/10 hover:text-enlace"
                    >
                      {a.label}
                    </button>
                  </li>
                ))}
              </ul>

              <DayPicker
                mode="range"
                locale={es}
                selected={rango}
                onSelect={setRango}
                defaultMonth={mesInicial}
                numberOfMonths={dosMeses ? 2 : 1}
                pagedNavigation
                disabled={(d) => isAfter(d, hoy)}
                endMonth={hoy}
                showOutsideDays={false}
                components={{
                  Chevron: ({ orientation, className }) =>
                    orientation === "left" ? (
                      <ChevronLeft size={18} className={className} />
                    ) : (
                      <ChevronRight size={18} className={className} />
                    ),
                }}
                classNames={{
                  root: "relative mx-auto w-fit md:mx-0",
                  months: "flex flex-col gap-6 sm:flex-row",
                  month: "space-y-3",
                  month_caption: "flex h-10 items-center justify-center",
                  caption_label: "font-display text-sm font-extrabold text-fuerte capitalize",
                  nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
                  button_previous:
                    "grid size-10 place-items-center rounded-full text-fuerte hover:bg-superficie disabled:opacity-30",
                  button_next:
                    "grid size-10 place-items-center rounded-full text-fuerte hover:bg-superficie disabled:opacity-30",
                  month_grid: "border-collapse",
                  weekdays: "",
                  weekday: "size-10 text-xs font-semibold text-tinta/75 capitalize",
                  week: "",
                  day: "p-0 text-center text-sm",
                  day_button:
                    "size-10 rounded-full font-medium text-fuerte transition-colors hover:bg-rojo/10 focus-visible:outline-3 focus-visible:outline-rojo disabled:cursor-not-allowed disabled:text-tinta/30 disabled:hover:bg-transparent",
                  today: "[&>button]:font-extrabold [&>button]:text-enlace",
                  selected: "",
                  range_start: "rounded-l-full bg-rojo/10 [&>button]:bg-rojo [&>button]:text-papel",
                  range_end: "rounded-r-full bg-rojo/10 [&>button]:bg-rojo [&>button]:text-papel",
                  range_middle: "bg-rojo/10 [&>button]:rounded-none [&>button]:text-enlace-fuerte",
                  outside: "[&>button]:font-normal [&>button]:text-tinta/70",
                  disabled: "",
                  hidden: "invisible",
                }}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-linea pt-4">
              <p className="text-sm text-tinta/75" aria-live="polite">
                {rango?.from
                  ? textoRango(aIso(rango.from), rango.to ? aIso(rango.to) : undefined)
                  : "Elige el inicio y el fin"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => aplicar(undefined)}
                  className="min-h-11 rounded-xl px-4 text-sm font-semibold text-tinta hover:text-enlace"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => aplicar(rango)}
                  disabled={!rango?.from}
                  className="min-h-11 rounded-xl bg-rojo px-5 font-display text-sm font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.97] disabled:opacity-40"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
