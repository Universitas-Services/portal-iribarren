"use client";

import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Imagen } from "@/lib/api/types";
import { CreditoImagen } from "./credito-imagen";

/**
 * Formato GALERIA: retícula asimétrica (la primera foto grande) en pantallas medianas y
 * carril deslizable en teléfonos. Cada foto abre un visor a pantalla completa con <dialog>,
 * que ya atrapa el foco, cierra con Esc y devuelve el foco a la miniatura.
 */
export function Galeria({ imagenes, titulo }: { imagenes: Imagen[]; titulo: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [actual, setActual] = useState<number | null>(null);
  const toque = useRef<number | null>(null);
  const total = imagenes.length;

  const abrir = (i: number) => {
    setActual(i);
    dialogo.current?.showModal();
  };
  const mover = (paso: number) => setActual((i) => (i === null ? i : (i + paso + total) % total));

  // Mientras el visor está abierto, la página de fondo no se desplaza.
  useEffect(() => {
    if (actual === null) return;
    const html = document.documentElement;
    const previo = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previo;
    };
  }, [actual]);

  const visibles = imagenes.slice(0, 5);
  // Retícula sin huecos (clases literales para que Tailwind las genere):
  // 5 fotos → 1 grande + 2×2; 3-4 → 1 grande + una columna; 2 → mitades.
  const DISPOSICION = {
    2: { lista: "sm:h-72 sm:grid-cols-2", grande: "" },
    3: {
      lista: "sm:h-[26rem] lg:h-[30rem] sm:grid-cols-3 sm:grid-rows-2",
      grande: "sm:col-span-2 sm:row-span-2",
    },
    4: {
      lista: "sm:h-[26rem] lg:h-[30rem] sm:grid-cols-3 sm:grid-rows-3",
      grande: "sm:col-span-2 sm:row-span-3",
    },
    5: {
      lista: "sm:h-[26rem] lg:h-[30rem] sm:grid-cols-4 sm:grid-rows-2",
      grande: "sm:col-span-2 sm:row-span-2",
    },
  } as const;
  const disposicion = DISPOSICION[Math.min(Math.max(visibles.length, 2), 5) as 2 | 3 | 4 | 5];
  const ocultas = total - visibles.length;
  const foto = actual === null ? null : imagenes[actual];

  return (
    <section aria-label={`Galería: ${titulo}`}>
      <ul
        className={`-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:overflow-visible ${disposicion.lista} sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden`}
      >
        {visibles.map((img, i) => (
          <li
            key={img.src}
            className={`relative w-[85%] shrink-0 snap-start sm:w-auto ${
              i === 0 ? disposicion.grande : ""
            }`}
          >
            <button
              type="button"
              onClick={() => abrir(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-tarjeta bg-noche shadow-tarjeta sm:aspect-auto sm:h-full sm:min-h-40"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={
                  i === 0 ? "(min-width: 640px) 432px, 85vw" : "(min-width: 640px) 216px, 85vw"
                }
                loading={i === 0 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
              />
              <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-noche/70 text-papel opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <Expand size={18} aria-hidden="true" />
              </span>
              {i === visibles.length - 1 && ocultas > 0 && (
                <span className="absolute inset-0 grid place-items-center bg-noche/65 font-display text-3xl font-extrabold text-papel">
                  +{ocultas}
                </span>
              )}
              <span className="sr-only">
                Ampliar foto {i + 1} de {total}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-tinta/70 sm:hidden">
        Desliza para ver las {total} fotos · toca una para ampliarla
      </p>

      <dialog
        ref={dialogo}
        aria-label={`Visor de fotos: ${titulo}`}
        onClose={() => setActual(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") mover(1);
          if (e.key === "ArrowLeft") mover(-1);
        }}
        onTouchStart={(e) => {
          toque.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const inicio = toque.current;
          const fin = e.changedTouches[0]?.clientX;
          if (inicio !== null && fin !== undefined && Math.abs(fin - inicio) > 50) {
            mover(fin < inicio ? 1 : -1);
          }
          toque.current = null;
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-noche/95 p-0 text-papel backdrop:bg-noche/80"
      >
        {foto && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="font-display font-bold" aria-live="polite">
                {actual! + 1} de {total}
              </p>
              <button
                type="button"
                onClick={() => dialogo.current?.close()}
                autoFocus
                className="grid size-11 place-items-center rounded-full bg-papel/10 transition-colors hover:bg-papel/20"
              >
                <X size={22} aria-hidden="true" />
                <span className="sr-only">Cerrar visor</span>
              </button>
            </div>

            <div className="relative flex-1">
              <Image
                key={foto.src}
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => mover(-1)}
                    className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-noche/70 transition-colors hover:bg-noche sm:left-6"
                  >
                    <ArrowLeft size={22} aria-hidden="true" />
                    <span className="sr-only">Foto anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(1)}
                    className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-noche/70 transition-colors hover:bg-noche sm:right-6"
                  >
                    <ArrowRight size={22} aria-hidden="true" />
                    <span className="sr-only">Foto siguiente</span>
                  </button>
                </>
              )}
            </div>

            <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-4 text-sm text-papel/80 sm:px-6">
              <span>
                {foto.ilustrativa && <span className="font-semibold">Foto ilustrativa · </span>}
                {foto.alt}
              </span>
              <CreditoImagen credito={foto.credito} />
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}
