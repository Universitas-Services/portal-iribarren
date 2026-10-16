"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Megaphone,
  MessageSquareText,
  Pause,
  Play,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Banner, BannerTone } from "@/lib/api/types";

const TONO: Record<
  BannerTone,
  { panel: string; texto: string; boton: string; Icon: LucideIcon; icono: string }
> = {
  rojo: {
    panel: "bg-rojo-oscuro text-papel",
    texto: "text-papel/90",
    boton: "bg-papel text-rojo-oscuro hover:bg-superficie",
    Icon: Megaphone,
    icono: "text-naranja/40",
  },
  calido: {
    panel: "bg-amarillo text-noche",
    texto: "text-noche/85",
    boton: "bg-noche text-papel hover:bg-tinta",
    Icon: MessageSquareText,
    icono: "text-papel/45",
  },
  tinta: {
    panel: "bg-noche text-papel",
    texto: "text-papel/85",
    boton: "bg-amarillo text-noche hover:bg-naranja",
    Icon: FileText,
    icono: "text-papel/10",
  },
};

const INTERVALO = 7000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const next = (i + banners.length) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [banners.length, reducedMotion],
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const autoplay = playing && !hovered && !reducedMotion && banners.length > 1;
  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => goTo(index + 1), INTERVALO);
    return () => window.clearTimeout(t);
  }, [autoplay, index, goTo]);

  if (banners.length === 0) return null;
  const controles = banners[index]?.tono === "calido" ? "text-noche" : "text-papel";

  return (
    <div
      aria-roledescription="carrusel"
      aria-label="Anuncios del PDUL"
      role="region"
      className="relative flex h-full min-h-[22rem] flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div
        ref={track}
        className="flex flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b, i) => {
          const t = TONO[b.tono];
          return (
            <article
              key={b.id}
              aria-roledescription="anuncio"
              aria-label={`${i + 1} de ${banners.length}`}
              aria-hidden={i !== index}
              className={`relative flex w-full shrink-0 snap-start flex-col overflow-hidden px-6 pt-8 pb-24 sm:px-10 sm:pt-10 lg:justify-end lg:pb-28 ${t.panel}`}
            >
              <t.Icon
                aria-hidden="true"
                strokeWidth={1}
                className={`pointer-events-none absolute -right-8 -bottom-6 size-64 lg:-top-12 lg:-right-16 lg:bottom-auto lg:size-[30rem] ${t.icono}`}
              />
              <h3 className="relative max-w-lg font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.1] font-extrabold">
                {b.titulo}
              </h3>
              <p className={`relative mt-4 max-w-md text-[1.0625rem] leading-relaxed ${t.texto}`}>
                {b.texto}
              </p>
              <Link
                href={b.enlace.href}
                tabIndex={i === index ? undefined : -1}
                className={`relative mt-7 inline-flex min-h-12 items-center gap-2 self-start rounded-xl px-5 font-display font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] ${t.boton}`}
              >
                {b.enlace.etiqueta}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 pb-4 sm:px-8 ${controles}`}
      >
        <div className="flex items-center" role="group" aria-label="Elegir anuncio">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al anuncio ${i + 1}: ${b.titulo}`}
              aria-current={i === index}
              className="grid h-11 w-8 place-items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,opacity] duration-200 ease-out-expo ${
                  i === index ? "w-6 bg-current opacity-100" : "w-2.5 bg-current opacity-45"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {!reducedMotion && banners.length > 1 && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="grid size-11 place-items-center rounded-full transition-colors hover:bg-current/10"
            >
              <span className="sr-only">
                {playing ? "Pausar el carrusel" : "Reanudar el carrusel"}
              </span>
              {playing ? (
                <Pause size={18} aria-hidden="true" />
              ) : (
                <Play size={18} aria-hidden="true" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="grid size-11 place-items-center rounded-full transition-[background-color,transform] duration-150 hover:bg-current/10 active:scale-[0.94]"
          >
            <span className="sr-only">Anuncio anterior</span>
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="grid size-11 place-items-center rounded-full transition-[background-color,transform] duration-150 hover:bg-current/10 active:scale-[0.94]"
          >
            <span className="sr-only">Anuncio siguiente</span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
