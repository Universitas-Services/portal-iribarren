"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

/*
 * Los filtros cambian la URL dentro de una transición: mientras llegan los resultados nuevos,
 * los anteriores siguen visibles y atenuados, en lugar de saltar a un skeleton en cada tecla.
 */

const Ctx = createContext<{ pendiente: boolean; iniciar: TransitionStartFunction } | null>(null);

export function TransicionListado({ children }: { children: ReactNode }) {
  const [pendiente, iniciar] = useTransition();
  return <Ctx value={{ pendiente, iniciar }}>{children}</Ctx>;
}

export function useTransicionListado() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTransicionListado va dentro de <TransicionListado>.");
  return ctx;
}

export function ZonaResultados({ children }: { children: ReactNode }) {
  const { pendiente } = useTransicionListado();
  return (
    <div
      aria-busy={pendiente}
      className={`transition-opacity duration-200 ${pendiente ? "opacity-55" : "opacity-100"}`}
    >
      {children}
      <p role="status" className="sr-only">
        {pendiente ? "Actualizando resultados…" : ""}
      </p>
    </div>
  );
}
