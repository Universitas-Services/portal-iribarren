import { LoadingStatus, Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

/** Skeleton de página para la navegación entre rutas. */
export default function Loading() {
  return (
    <div>
      <LoadingStatus label="Cargando la página…" />
      <div aria-hidden="true" className="skeleton h-[clamp(14rem,38vh,22rem)] rounded-none" />
      <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-12">
          <SkeletonCard className="lg:col-span-8">
            <Skeleton className="h-7 w-2/5" />
            <SkeletonText className="mt-6" lines={4} />
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-4" />
          <SkeletonCard className="lg:col-span-5" />
          <SkeletonCard className="lg:col-span-7" />
        </div>
      </div>
    </div>
  );
}
