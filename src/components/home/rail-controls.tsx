"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

/** Flechas para desplazar un carril horizontal por tarjetas completas. */
export function RailControls({ targetId }: { targetId: string }) {
  const mover = (dir: 1 | -1) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paso = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    el.scrollBy({ left: dir * (paso + 20), behavior: reduce ? "auto" : "smooth" });
  };

  const clase =
    "grid size-11 place-items-center rounded-full bg-papel text-noche shadow-tarjeta transition-[transform,color] duration-150 hover:text-rojo active:scale-[0.94]";

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => mover(-1)} aria-controls={targetId} className={clase}>
        <span className="sr-only">Noticias anteriores</span>
        <ArrowLeft size={20} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => mover(1)} aria-controls={targetId} className={clase}>
        <span className="sr-only">Más noticias</span>
        <ArrowRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
