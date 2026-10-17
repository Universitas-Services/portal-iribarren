"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cerrarSesionAccion } from "@/lib/auth/acciones";

/** Menú de la cuenta en el encabezado de escritorio: Mi cuenta y Cerrar sesión. */
export function MenuUsuario({ nombre, corto }: { nombre: string; corto: string }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const inicial = corto.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={caja} className="relative">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 items-center gap-2.5 rounded-full py-1 pr-3 pl-1 font-display text-[0.9375rem] font-semibold text-noche transition-colors hover:bg-superficie"
      >
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-rojo font-display font-extrabold text-papel"
        >
          {inicial}
        </span>
        <span className="max-w-40 truncate">{corto}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      {abierto && (
        <div
          id={id}
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-papel p-2 shadow-elevada ring-1 ring-linea"
        >
          <p className="truncate px-3 pt-2 pb-3 text-sm text-tinta/75">{nombre}</p>
          <Link
            href="/mi-cuenta"
            onClick={() => setAbierto(false)}
            className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 font-semibold text-noche hover:bg-superficie"
          >
            <UserRound size={18} aria-hidden="true" className="text-rojo" />
            Mi cuenta
          </Link>
          <form action={cerrarSesionAccion}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 font-semibold text-noche hover:bg-superficie"
            >
              <LogOut size={18} aria-hidden="true" className="text-rojo" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
