import { ListadoSkeleton } from "@/components/noticias/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton del listado de noticias durante la navegación. */
export default function Loading() {
  return (
    <>
      <div className="patron-urbano">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14 lg:pb-32">
          <Skeleton className="h-4 w-36 opacity-25" />
          <Skeleton className="mt-6 h-12 w-80 max-w-full opacity-25" />
          <Skeleton className="mt-4 h-5 w-[32rem] max-w-full opacity-25" />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8">
        <ListadoSkeleton />
      </div>
    </>
  );
}
