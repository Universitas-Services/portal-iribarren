"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { Foto } from "./hero";

/*
 * Fotos de la ciudad que se alternan con un fundido en el fondo del hero. El crédito de la foto
 * visible va junto a los botones. Cambian solas cada 7 s, con un botón para pausar (WCAG 2.2.2);
 * con «reducir movimiento» no avanzan solas.
 */

const INTERVALO_MS = 7000;

type Estado = { fotos: Foto[]; actual: number; pausado: boolean; alternar: () => void };
const Contexto = createContext<Estado | null>(null);

function useCarrusel() {
  const c = use(Contexto);
  if (!c) throw new Error("Falta CarruselProvider");
  return c;
}

export function CarruselProvider({ fotos, children }: { fotos: Foto[]; children: ReactNode }) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cambiar = () => setReducido(mq.matches);
    cambiar();
    mq.addEventListener("change", cambiar);
    return () => mq.removeEventListener("change", cambiar);
  }, []);

  useEffect(() => {
    if (pausado || reducido || fotos.length < 2) return;
    const t = setInterval(() => {
      if (!document.hidden) setActual((i) => (i + 1) % fotos.length);
    }, INTERVALO_MS);
    return () => clearInterval(t);
  }, [pausado, reducido, fotos.length]);

  return (
    <Contexto
      value={{
        fotos,
        actual,
        pausado: pausado || reducido,
        alternar: () => {
          if (reducido) {
            setReducido(false);
            setPausado(false);
          } else setPausado((p) => !p);
        },
      }}
    >
      {children}
    </Contexto>
  );
}

/** Capa de fondo: todas las fotos apiladas; solo la actual es opaca. */
export function FondoCarrusel() {
  const { fotos, actual } = useCarrusel();
  return (
    <div className="absolute inset-0 lg:left-[36%]">
      {fotos.map((f, i) => (
        <Image
          key={f.src}
          src={f.src}
          alt={i === actual ? f.alt : ""}
          aria-hidden={i === actual ? undefined : true}
          fill
          // La primera se precarga (LCP); la actual y la siguiente se cargan ya, para que el
          // fundido nunca muestre un hueco. `preload` y `loading` no se combinan.
          {...(i === 0
            ? { preload: true }
            : { loading: i === actual || i === (actual + 1) % fotos.length ? "eager" : "lazy" })}
          sizes="(min-width: 1024px) 64vw, 100vw"
          className={`hero-fondo object-cover transition-opacity duration-[1400ms] ease-in-out ${
            i === actual ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: f.posicion ?? "50% 35%" }}
        />
      ))}
    </div>
  );
}

/** Crédito de la foto visible y el botón para pausar o seguir el cambio de fotos. */
export function CreditoCarrusel() {
  const { fotos, actual, pausado, alternar } = useCarrusel();
  const foto = fotos[actual]!;
  return (
    <div className="mt-6 flex items-center gap-3 text-xs text-papel/70">
      {fotos.length > 1 && (
        <button
          type="button"
          onClick={alternar}
          aria-label={pausado ? "Seguir cambiando las fotos" : "Pausar el cambio de fotos"}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-papel/30 text-papel/80 transition-colors hover:border-papel/60 hover:text-papel"
        >
          {pausado ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      )}
      <p>
        Foto:{" "}
        <a href={foto.fuente} rel="noopener noreferrer" target="_blank" className="underline">
          {foto.autor}
        </a>{" "}
        ·{" "}
        <a
          href={foto.licencia.url}
          rel="noopener noreferrer license"
          target="_blank"
          className="underline"
        >
          {foto.licencia.nombre}
        </a>
      </p>
    </div>
  );
}
