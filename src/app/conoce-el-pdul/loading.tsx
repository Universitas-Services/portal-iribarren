import { LoadingStatus, Skeleton, SkeletonCard } from "@/components/ui/skeleton";

/** Skeleton de «Conoce el PDUL»: índice lateral y secciones de lectura. */
export default function Loading() {
  return (
    <>
      <LoadingStatus label="Cargando la página…" />
      <div className="patron-urbano">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14 lg:pb-32">
          <Skeleton className="h-4 w-40 opacity-25" />
          <Skeleton className="mt-6 h-12 w-80 max-w-full opacity-25" />
          <Skeleton className="mt-4 h-5 w-[36rem] max-w-full opacity-25" />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-16 grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-24 sm:px-6 lg:-mt-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8">
        <div aria-hidden="true" className="hidden space-y-3 lg:mt-24 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-40" />
          ))}
        </div>
        <div className="space-y-8">
          <SkeletonCard className="h-72" />
          <SkeletonCard className="h-56" />
          <SkeletonCard className="h-80" />
        </div>
      </div>
    </>
  );
}
