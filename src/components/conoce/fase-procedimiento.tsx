"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

/**
 * Una fase del procedimiento. En teléfono se pliega (solo la primera abierta) para no hacer
 * una página interminable; desde escritorio se ven todas y el botón queda como encabezado.
 */
export function FaseProcedimiento({
  numero,
  nombre,
  duracion,
  abiertaAlInicio = false,
  children,
}: {
  numero: string;
  nombre: string;
  duracion?: string;
  abiertaAlInicio?: boolean;
  children: ReactNode;
}) {
  const [abierta, setAbierta] = useState(abiertaAlInicio);
  const id = useId();

  const cabecera = (
    <>
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-2xl bg-noche font-display text-lg font-extrabold text-papel"
      >
        {numero}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-xs font-bold tracking-wider text-enlace uppercase">
          Fase {numero}
          {duracion && <span className="text-tinta/70"> · {duracion}</span>}
        </span>
        <span className="mt-0.5 block font-display text-lg font-extrabold text-fuerte sm:text-xl">
          {nombre}
        </span>
      </span>
    </>
  );

  return (
    <li className="rounded-2xl border border-linea">
      <h3>
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={id}
          onClick={() => setAbierta((v) => !v)}
          className="flex w-full items-center gap-4 p-4 text-left sm:p-5 lg:hidden"
        >
          {cabecera}
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`shrink-0 text-tinta/60 transition-transform duration-200 ${abierta ? "rotate-180" : ""}`}
          />
        </button>
        <span className="hidden items-center gap-4 p-6 pb-0 lg:flex">{cabecera}</span>
      </h3>
      <div
        id={id}
        className={`px-4 pb-5 sm:px-5 lg:block lg:px-6 lg:pt-4 lg:pb-6 ${abierta ? "" : "hidden"}`}
      >
        {children}
      </div>
    </li>
  );
}
