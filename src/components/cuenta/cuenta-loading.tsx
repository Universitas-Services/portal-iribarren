import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";
import { FormularioSkeleton } from "./marco-cuenta";

/** Skeleton compartido por las pantallas de cuenta durante la navegación. */
export function CuentaLoading() {
  return (
    <>
      <LoadingStatus label="Cargando…" />
      <div className="patron-urbano">
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14 lg:pb-32">
          <Skeleton className="h-4 w-36 opacity-25" />
          <Skeleton className="mt-6 h-12 w-72 max-w-full opacity-25" />
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-16 max-w-xl px-4 pb-24 sm:px-6 lg:-mt-20">
        <div className="rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-10">
          <FormularioSkeleton />
        </div>
      </div>
    </>
  );
}
