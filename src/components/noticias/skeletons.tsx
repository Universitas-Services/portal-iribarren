import type { CSSProperties } from "react";
import { LoadingStatus, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import type { PostFormat } from "@/lib/api/types";
import { acomodarMosaico } from "@/lib/noticias/mosaico";

/** Skeletons de las páginas de noticias, con la misma forma que el contenido real. */

function TarjetaSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-tarjeta bg-papel shadow-tarjeta">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="p-6">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-4 h-6 w-11/12" />
        <SkeletonText className="mt-4" lines={2} />
      </div>
    </div>
  );
}

export function FiltrosSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-tarjeta bg-papel p-5 shadow-tarjeta sm:p-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[2fr_1.2fr_1.6fr]">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="col-span-2 lg:col-span-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-12 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mismo acomodo que el listado real, con una mezcla típica de formatos. */
const FORMATOS_SKELETON: PostFormat[] = [
  "GALERIA",
  "IMAGEN",
  "DOCUMENTO",
  "DOCUMENTO",
  "TEXTO",
  "IMAGEN",
  "TEXTO",
];
const EN_TABLET = acomodarMosaico(FORMATOS_SKELETON, 2);
const EN_ESCRITORIO = acomodarMosaico(FORMATOS_SKELETON, 4);

export function ListadoSkeleton() {
  return (
    <div>
      <LoadingStatus label="Cargando noticias…" />
      <FiltrosSkeleton />
      <div aria-hidden="true" className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-4 w-40" />
      <div
        aria-hidden="true"
        className="mt-6 grid gap-4 sm:auto-rows-[12rem] sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
      >
        {FORMATOS_SKELETON.map((_, i) => {
          const t = EN_TABLET[i]!;
          const e = EN_ESCRITORIO[i]!;
          return (
            <div
              key={i}
              style={
                {
                  "--sm-col": `${t.col} / span ${t.w}`,
                  "--sm-row": `${t.row} / span ${t.h}`,
                  "--lg-col": `${e.col} / span ${e.w}`,
                  "--lg-row": `${e.row} / span ${e.h}`,
                } as CSSProperties
              }
              className="h-48 sm:[grid-column:var(--sm-col)] sm:[grid-row:var(--sm-row)] sm:h-auto lg:[grid-column:var(--lg-col)] lg:[grid-row:var(--lg-row)]"
            >
              <Skeleton className="h-full rounded-tarjeta" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RelacionadasSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <LoadingStatus label="Cargando más noticias…" />
      {Array.from({ length: 3 }, (_, i) => (
        <TarjetaSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetalleSkeleton() {
  return (
    <div>
      <LoadingStatus label="Cargando la noticia…" />
      <div className="patron-urbano">
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-28 sm:px-6 lg:pt-14">
          <Skeleton className="h-4 w-48 opacity-25" />
          <Skeleton className="mt-8 h-5 w-56 opacity-25" />
          <Skeleton className="mt-5 h-10 w-full opacity-25" />
          <Skeleton className="mt-3 h-10 w-3/4 opacity-25" />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-16 max-w-4xl px-4 sm:px-6">
        <Skeleton className="aspect-[16/9] w-full rounded-tarjeta shadow-tarjeta" />
        <SkeletonText className="mt-10 max-w-[68ch]" lines={6} />
      </div>
    </div>
  );
}
