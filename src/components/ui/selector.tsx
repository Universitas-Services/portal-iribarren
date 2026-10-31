"use client";

import { AlertCircle, Check, ChevronDown, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/*
 * Selector del portal: reemplaza al <select> nativo con el estilo de los demás campos.
 * Sigue el patrón «combobox de solo selección» de WAI-ARIA: el foco queda en el campo y la
 * opción activa se anuncia con aria-activedescendant. Teclado: flechas, Inicio/Fin, escribir
 * para saltar, Enter o Espacio para elegir, Esc para cerrar. En escritorio abre un panel bajo
 * el campo; en teléfono, una hoja desde abajo con opciones grandes. El valor viaja en un
 * <input type="hidden"> para que el formulario lo envíe igual que un <select>.
 */

export type OpcionSelector = string | { valor: string; texto: string; detalle?: string };

const normalizar = (o: OpcionSelector) =>
  typeof o === "string" ? { valor: o, texto: o, detalle: undefined } : o;

/** Compara sin tildes ni mayúsculas, para saltar escribiendo «cuji» → «El Cují». */
const plano = (t: string) =>
  t
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function Selector({
  id,
  name = id,
  etiqueta,
  opciones,
  valor,
  valorInicial = "",
  onCambio,
  vacio = "Selecciona una opción",
  permitirVacio = false,
  error,
  ayuda,
  Icono,
  compacto = false,
  ocultarEtiqueta = false,
  invalido = false,
  className = "",
  ancho = "w-full",
}: {
  id: string;
  name?: string;
  etiqueta: string;
  opciones: readonly OpcionSelector[];
  /** Controlado (filtros). Si no se pasa, el selector guarda su propio valor. */
  valor?: string;
  valorInicial?: string;
  onCambio?: (valor: string) => void;
  /** Texto cuando no hay nada elegido. */
  vacio?: string;
  /** Muestra `vacio` como opción elegible (por ejemplo «Todas» o «Prefiero no indicarla»). */
  permitirVacio?: boolean;
  error?: string;
  ayuda?: string;
  Icono?: LucideIcon;
  /** Para listas cortas junto a otro campo (prefijos V/E): sin hoja en el teléfono. */
  compacto?: boolean;
  ocultarEtiqueta?: boolean;
  /** Marca el campo en rojo sin mensaje propio (el error lo muestra el campo vecino). */
  invalido?: boolean;
  className?: string;
  ancho?: string;
}) {
  const lista = [
    ...(permitirVacio ? [{ valor: "", texto: vacio, detalle: undefined }] : []),
    ...opciones.map(normalizar),
  ];
  const [propio, setPropio] = useState(valorInicial);
  const actual = valor ?? propio;
  const elegida = lista.find((o) => o.valor === actual);

  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const campo = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const busqueda = useRef({ texto: "", hasta: 0 });
  const base = useId();
  const idLista = `${base}-lista`;
  const idEtiqueta = `${base}-etiqueta`;
  const idOpcion = (i: number) => `${base}-op-${i}`;

  function abrir(indice?: number) {
    const i = lista.findIndex((o) => o.valor === actual);
    setActiva(indice ?? Math.max(0, i));
    setAbierto(true);
  }

  function elegir(i: number) {
    const o = lista[i];
    if (!o) return;
    if (valor === undefined) setPropio(o.valor);
    onCambio?.(o.valor);
    setAbierto(false);
    campo.current?.focus();
  }

  // Mantiene visible la opción activa al moverse con el teclado.
  useEffect(() => {
    if (abierto) document.getElementById(idOpcion(activa))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idOpcion depende solo de base
  }, [abierto, activa]);

  // Tocar fuera cierra sin elegir.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !campo.current?.contains(t)) setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  function saltarA(letra: string) {
    const ahora = Date.now();
    const b = busqueda.current;
    b.texto = ahora < b.hasta ? b.texto + letra : letra;
    b.hasta = ahora + 600;
    const desde = abierto ? activa : lista.findIndex((o) => o.valor === actual);
    const orden = [...lista.keys()].map(
      (k) => (k + Math.max(0, desde) + (b.texto.length === 1 ? 1 : 0)) % lista.length,
    );
    const buscado = plano(b.texto);
    // Primero lo que empieza así; si no, cualquier palabra («cu» → «El Cují»).
    const i =
      orden.find((k) => plano(lista[k]!.texto).startsWith(buscado)) ??
      orden.find((k) =>
        plano(lista[k]!.texto)
          .split(/[\s/(-]+/)
          .some((p) => p.startsWith(buscado)),
      );
    if (i === undefined) return;
    if (abierto) setActiva(i);
    else elegir(i);
  }

  function alTeclear(e: KeyboardEvent<HTMLDivElement>) {
    const ultimo = lista.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!abierto) abrir();
        else setActiva((a) => Math.min(ultimo, a + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        if (!abierto) abrir();
        else setActiva((a) => Math.max(0, a - 1));
        return;
      case "Home":
        e.preventDefault();
        if (abierto) setActiva(0);
        else abrir(0);
        return;
      case "End":
        e.preventDefault();
        if (abierto) setActiva(ultimo);
        else abrir(ultimo);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (abierto) elegir(activa);
        else abrir();
        return;
      case "Escape":
        if (abierto) {
          e.preventDefault();
          setAbierto(false);
        }
        return;
      case "Tab":
        if (abierto) elegir(activa);
        return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) saltarA(e.key);
    }
  }

  const describe = [error && `${id}-error`, ayuda && !error && `${id}-ayuda`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`relative ${className}`}>
      <span
        id={idEtiqueta}
        onClick={() => campo.current?.focus()}
        className={
          ocultarEtiqueta ? "sr-only" : "mb-1.5 block font-display text-sm font-bold text-fuerte"
        }
      >
        {etiqueta}
      </span>
      <div
        ref={campo}
        id={id}
        role="combobox"
        tabIndex={0}
        aria-labelledby={`${idEtiqueta} ${base}-valor`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-activedescendant={abierto ? idOpcion(activa) : undefined}
        aria-invalid={error || invalido ? true : undefined}
        aria-describedby={describe || undefined}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={alTeclear}
        className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border bg-tarjeta text-left transition-colors outline-none select-none focus-visible:border-rojo focus-visible:ring-2 focus-visible:ring-rojo/20 ${ancho} ${
          compacto ? "px-3" : "px-4"
        } ${error || invalido ? "border-rojo" : abierto ? "border-rojo" : "border-linea hover:border-fuerte/40"}`}
      >
        {Icono && <Icono size={18} aria-hidden="true" className="shrink-0 text-enlace" />}
        <span
          id={`${base}-valor`}
          className={`min-w-0 flex-1 truncate ${
            elegida && (elegida.valor || permitirVacio)
              ? compacto
                ? "font-display font-bold text-fuerte"
                : "font-semibold text-fuerte"
              : "text-tinta/70"
          }`}
        >
          {elegida?.texto ?? vacio}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-tinta/60 transition-transform duration-200 ${abierto ? "rotate-180 text-enlace" : ""}`}
        />
      </div>
      <input type="hidden" name={name} value={actual} />

      {abierto && (
        <>
          {!compacto && (
            <div aria-hidden="true" className="fixed inset-0 z-40 bg-noche/40 sm:hidden" />
          )}
          <div
            ref={panel}
            className={
              compacto
                ? "absolute left-0 z-50 mt-2 min-w-full rounded-2xl bg-tarjeta p-1.5 shadow-elevada ring-1 ring-linea"
                : "fixed inset-x-0 bottom-0 z-50 flex max-h-[75dvh] flex-col rounded-t-3xl bg-tarjeta pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-elevada sm:absolute sm:inset-x-0 sm:bottom-auto sm:mt-2 sm:max-h-80 sm:rounded-2xl sm:pb-0 sm:ring-1 sm:ring-linea"
            }
          >
            {!compacto && (
              <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2 sm:hidden">
                <p className="font-display text-lg font-extrabold text-fuerte">{etiqueta}</p>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setAbierto(false);
                    campo.current?.focus();
                  }}
                  className="grid size-11 place-items-center rounded-full bg-superficie"
                >
                  <X size={20} aria-hidden="true" />
                  <span className="sr-only">Cerrar</span>
                </button>
              </div>
            )}
            <ul
              id={idLista}
              role="listbox"
              aria-labelledby={idEtiqueta}
              className={`overflow-y-auto overscroll-contain ${compacto ? "" : "px-3 pb-2 sm:p-1.5"}`}
            >
              {lista.map((o, i) => {
                const seleccionada = o.valor === actual;
                return (
                  <li
                    key={o.valor || "vacio"}
                    id={idOpcion(i)}
                    role="option"
                    aria-selected={seleccionada}
                    onPointerEnter={() => setActiva(i)}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => elegir(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors ${
                      compacto ? "min-h-10 font-display font-bold" : "min-h-12 sm:min-h-11"
                    } ${i === activa ? "bg-rojo/8 text-enlace" : "text-fuerte"} ${
                      seleccionada ? "font-semibold" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1 py-2">
                      <span className="block">{o.texto}</span>
                      {o.detalle && (
                        <span className="block text-sm font-normal text-tinta/70">{o.detalle}</span>
                      )}
                    </span>
                    <Check
                      size={18}
                      aria-hidden="true"
                      className={`shrink-0 text-enlace ${seleccionada ? "" : "invisible"}`}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-tinta/70">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-enlace">
          <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
