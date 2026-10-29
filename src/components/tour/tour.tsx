"use client";

import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { marcarTourVistoAccion } from "@/lib/auth/acciones";
import { recorridoDe, type PasoTour } from "@/lib/tour/pasos";

/*
 * Recorrido guiado. La brújula, junto al agente, lo abre en cualquier página con o sin sesión. En
 * el primer ingreso de una cuenta se abre solo, con un saludo antes. Al terminarlo o saltarlo
 * queda marcado como visto en la cuenta. Sin librerías: una capa oscura con un hueco sobre el
 * elemento del paso y un globo con el texto. En el teléfono, el globo es una hoja de borde a borde.
 */

/** Avisa al agente para que cierre su panel mientras dura el recorrido. */
export const EVENTO_TOUR = "pdul:tour";

const MARGEN = 8;

/** Posición del objetivo, con el paso al que pertenece: la de otro paso no vale. */
type Caja = { para: PasoTour; top: number; left: number; width: number; height: number };

const visible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
};

/**
 * Los elementos que resalta el paso: los visibles del primer selector que encuentre alguno. Un
 * selector puede abarcar varios (por ejemplo, el buscador y las pestañas de formato): el hueco
 * los cubre a todos.
 */
function objetivoDe(paso: PasoTour | undefined) {
  for (const sel of paso?.objetivo ?? []) {
    const els = [...document.querySelectorAll(sel)].filter(visible);
    if (els.length) return els;
  }
  return undefined;
}

/** El rectángulo que cubre a todos los elementos. */
function cajaDe(els: Element[]) {
  const rs = els.map((e) => e.getBoundingClientRect());
  const top = Math.min(...rs.map((r) => r.top));
  const left = Math.min(...rs.map((r) => r.left));
  const bottom = Math.max(...rs.map((r) => r.bottom));
  const right = Math.max(...rs.map((r) => r.right));
  return { top, left, width: right - left, height: bottom - top, bottom };
}

const sinMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Tour({ conSesion, pendiente }: { conSesion: boolean; pendiente: boolean }) {
  const ruta = usePathname();
  // El recorrido es de una página: si se navega a otra, deja de valer y se cierra.
  // `solo`: lo abrió el primer ingreso, no la brújula.
  const [abierto, setAbierto] = useState<{
    ruta: string;
    pasos: PasoTour[];
    solo: boolean;
  } | null>(null);
  const [i, setI] = useState(0);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [arriba, setArriba] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const globo = useRef<HTMLDivElement>(null);
  const lanzado = useRef(false);
  const id = useId();

  const abrir = useCallback(
    (bienvenida = false) => {
      window.dispatchEvent(new Event(EVENTO_TOUR));
      setAbierto({ ruta, pasos: recorridoDe(ruta, { conSesion, bienvenida }), solo: bienvenida });
      setI(0);
    },
    [ruta, conSesion],
  );

  const cerrar = useCallback(() => {
    // El del primer ingreso queda visto al terminarlo o saltarlo: no vuelve a abrirse solo.
    if (abierto?.solo) startTransition(() => marcarTourVistoAccion());
    setAbierto(null);
    setCaja(null);
    boton.current?.focus();
  }, [abierto]);

  // Primer ingreso: se abre solo, una vez, cuando la página ya pintó lo que va a resaltar.
  useEffect(() => {
    if (!pendiente || lanzado.current) return;
    lanzado.current = true;
    const t = setTimeout(() => abrir(true), 700);
    return () => clearTimeout(t);
  }, [pendiente, abrir]);

  const pasos = abierto?.ruta === ruta ? abierto.pasos : null;
  const paso = pasos?.[i];

  // Lleva el objetivo a la vista y sigue su posición al hacer scroll o cambiar el tamaño.
  useLayoutEffect(() => {
    if (!paso) return;
    // Un paso de una sección que se muestra por el #id (Conoce el PDUL): primero se abre, como
    // si se eligiera en el índice de la página.
    if (paso.seccion && window.location.hash !== `#${paso.seccion}`)
      window.location.hash = paso.seccion;

    let marco = 0;
    let espera = 0;
    let els: Element[] | undefined;
    const medir = () => {
      if (!els) return;
      cancelAnimationFrame(marco);
      marco = requestAnimationFrame(() => {
        const r = cajaDe(els!);
        setCaja({ para: paso, top: r.top, left: r.left, width: r.width, height: r.height });
        // El globo va donde hay más espacio; en el teléfono, en el borde contrario al objetivo.
        // Con un objetivo muy alto (una sección entera), abajo: así no tapa su título.
        const alto = r.height > window.innerHeight * 0.6;
        setArriba(!alto && r.top + r.height / 2 > window.innerHeight / 2);
      });
    };
    // El elemento puede tardar un instante en mostrarse (sección recién abierta, contenido en
    // streaming): se reintenta hasta 1,5 s antes de dejar el paso centrado.
    const buscar = (intento = 0) => {
      els = objetivoDe(paso);
      if (!els) {
        if (intento < 30) espera = window.setTimeout(() => buscar(intento + 1), 50);
        return;
      }
      const r0 = cajaDe(els);
      if (r0.top < 72 || r0.bottom > window.innerHeight)
        els[0]!.scrollIntoView({
          block: r0.height > window.innerHeight * 0.6 ? "start" : "center",
          behavior: sinMovimiento() ? "auto" : "smooth",
        });
      medir();
    };
    buscar();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      clearTimeout(espera);
      cancelAnimationFrame(marco);
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [paso]);

  // El foco pasa al globo en cada paso: el lector de pantalla lee el título y el texto.
  useEffect(() => {
    // Sin desplazar: el foco no debe cortar el scroll que lleva al elemento del paso.
    if (paso) globo.current?.focus({ preventScroll: true });
  }, [paso]);

  const total = pasos?.length ?? 0;
  const ultimo = i === total - 1;

  function tecla(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
    } else if (e.key === "ArrowRight" && !ultimo) setI(i + 1);
    else if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    else if (e.key === "Tab") {
      // Foco atrapado en el globo mientras dura el recorrido.
      const enfocables = globo.current?.querySelectorAll<HTMLElement>("button");
      if (!enfocables?.length) return;
      const primero = enfocables[0]!;
      const fin = enfocables[enfocables.length - 1]!;
      if (
        e.shiftKey &&
        (document.activeElement === primero || document.activeElement === globo.current)
      ) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault();
        primero.focus();
      }
    }
  }

  const hueco =
    caja && paso && caja.para === paso
      ? {
          top: caja.top - MARGEN,
          left: caja.left - MARGEN,
          width: caja.width + MARGEN * 2,
          height: caja.height + MARGEN * 2,
        }
      : null;

  return (
    <>
      <button
        ref={boton}
        type="button"
        data-tour="ayuda"
        onClick={() => abrir()}
        aria-label="Recorrido guiado de esta página"
        title="Recorrido guiado"
        className="grid size-11 place-items-center rounded-full bg-noche text-papel shadow-elevada ring-2 ring-papel transition-transform duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-morado-activo active:scale-95"
      >
        <Compass size={20} aria-hidden="true" />
      </button>

      {paso &&
        createPortal(
          <div className="fixed inset-0 z-[60] print:hidden" onKeyDown={tecla}>
            {/* Bloquea la página detrás; el hueco deja ver el objetivo. */}
            {hueco ? (
              <div
                aria-hidden="true"
                className="pointer-events-none fixed rounded-2xl shadow-[0_0_0_200vmax_rgb(46_19_77/0.6)] ring-2 ring-papel motion-safe:transition-[top,left,width,height] motion-safe:duration-300 motion-safe:ease-out-expo"
                style={hueco}
              />
            ) : (
              <div aria-hidden="true" className="fixed inset-0 bg-noche/60" />
            )}
            <div aria-hidden="true" className="fixed inset-0" />

            <div
              ref={globo}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${id}-titulo`}
              aria-describedby={`${id}-texto`}
              tabIndex={-1}
              key={i}
              className={[
                "fixed inset-x-0 mx-auto max-w-md bg-papel p-5 shadow-elevada outline-none motion-safe:animate-[aparecer_240ms_var(--ease-out-expo)] sm:p-6",
                // Con objetivo: hoja de borde a borde en el teléfono, en el lado contrario.
                hueco
                  ? `w-full sm:w-[calc(100%-2rem)] sm:rounded-tarjeta ${arriba ? "top-0 rounded-b-tarjeta sm:top-4" : "bottom-0 rounded-t-tarjeta sm:bottom-4"}`
                  : "top-1/2 w-[calc(100%-2rem)] -translate-y-1/2 rounded-tarjeta",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-rojo tabular-nums">
                  Paso {i + 1} de {total}
                </p>
                <button
                  type="button"
                  onClick={cerrar}
                  aria-label="Cerrar el recorrido"
                  className="-mt-2 -mr-2 grid size-9 shrink-0 place-items-center rounded-full text-tinta/70 transition-colors hover:bg-superficie hover:text-noche"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <h2
                id={`${id}-titulo`}
                className="mt-1 font-display text-xl font-extrabold text-noche"
              >
                {paso.titulo}
              </h2>
              <p id={`${id}-texto`} className="mt-2 leading-relaxed text-tinta">
                {paso.texto}
              </p>
              <div aria-hidden="true" className="mt-4 flex gap-1.5">
                {pasos!.map((_, k) => (
                  <span
                    key={k}
                    className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-rojo" : "bg-linea"}`}
                  />
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {ultimo ? (
                  <span />
                ) : (
                  <button
                    type="button"
                    onClick={cerrar}
                    className="min-h-11 text-sm font-semibold text-tinta underline underline-offset-2 hover:text-noche"
                  >
                    Saltar el recorrido
                  </button>
                )}
                <div className="flex gap-2">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => setI(i - 1)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 font-display font-semibold text-noche ring-1 ring-linea transition-colors hover:bg-superficie"
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                      Anterior
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => (ultimo ? cerrar() : setI(i + 1))}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-rojo px-5 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.97]"
                  >
                    {ultimo ? "Terminar" : "Siguiente"}
                    {!ultimo && <ArrowRight size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
