import { LoadingStatus, Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

/** Skeletons a medida de cada bloque del Inicio: misma forma, sin saltos al cargar. */

export function ThermometerSkeleton({ className = "" }: { className?: string }) {
  return (
    <SkeletonCard className={className}>
      <LoadingStatus label="Cargando el avance del PDUL…" />
      <div className="flex items-start justify-between gap-6">
        <div className="w-full max-w-md">
          <Skeleton className="h-7 w-2/3" />
          <SkeletonText className="mt-4" lines={2} />
        </div>
        <Skeleton className="h-14 w-20" />
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-7 md:gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 md:flex-col md:gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-24 md:w-16" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
}

export function BannersSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`min-h-[22rem] overflow-hidden rounded-tarjeta bg-papel p-8 shadow-tarjeta sm:p-10 ${className}`}
    >
      <LoadingStatus label="Cargando anuncios…" />
      <Skeleton className="h-9 w-4/5" />
      <Skeleton className="mt-3 h-9 w-3/5" />
      <SkeletonText className="mt-6 max-w-md" lines={3} />
      <Skeleton className="mt-8 h-12 w-48 rounded-xl" />
    </div>
  );
}

export function NewsRailSkeleton() {
  return (
    <div>
      <LoadingStatus label="Cargando noticias…" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <div className="mt-8 flex gap-5 overflow-hidden pb-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="w-[85%] shrink-0 overflow-hidden rounded-tarjeta bg-papel shadow-tarjeta sm:w-[46%] lg:w-[31%]"
          >
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="p-6">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-4 h-6 w-11/12" />
              <SkeletonText className="mt-4" lines={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
