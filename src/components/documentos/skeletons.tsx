import { LoadingStatus, Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** Skeletons del repositorio documental, con la forma del panel y de las filas reales. */

function FilaSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:flex-row sm:items-center sm:p-6"
    >
      <Skeleton className="h-16 w-13 shrink-0 rounded-md" />
      <div className="flex-1">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="mt-3 h-5 w-4/5" />
        <SkeletonText className="mt-3" lines={2} />
      </div>
      <Skeleton className="h-11 w-32 rounded-xl" />
    </div>
  );
}

export function RepositorioSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
      <LoadingStatus label="Cargando documentos…" />
      <div aria-hidden="true" className="rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="mt-6 hidden h-10 rounded-xl lg:block" />
        <div className="mt-6 hidden space-y-2 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-9 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        {Array.from({ length: 5 }, (_, i) => (
          <FilaSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DocumentoSkeleton() {
  return (
    <div>
      <LoadingStatus label="Cargando el documento…" />
      <div className="patron-urbano">
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14">
          <Skeleton className="h-4 w-56 opacity-25" />
          <Skeleton className="mt-8 h-6 w-64 rounded-full opacity-25" />
          <Skeleton className="mt-5 h-10 w-full opacity-25" />
          <Skeleton className="mt-3 h-10 w-2/3 opacity-25" />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-16 max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-28 rounded-tarjeta shadow-tarjeta" />
        <Skeleton className="h-64 rounded-tarjeta" />
      </div>
    </div>
  );
}
