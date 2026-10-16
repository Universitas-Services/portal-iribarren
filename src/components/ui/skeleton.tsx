import type { ReactNode } from "react";

/**
 * Primitivas de carga. Toda página nueva arma su `loading.tsx` y sus fallbacks de
 * <Suspense> con estas piezas, imitando la forma real del contenido.
 */

type Props = { className?: string };

/** Bloque gris con brillo (estático si la persona pidió reducir el movimiento). */
export function Skeleton({ className = "" }: Props) {
  return <div aria-hidden="true" className={`skeleton rounded-lg ${className}`} />;
}

/** Varias líneas de texto; la última más corta. */
export function SkeletonText({ lines = 3, className = "" }: Props & { lines?: number }) {
  return (
    <div aria-hidden="true" className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skeleton h-3.5 rounded-full ${i === lines - 1 ? "w-3/5" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** Tarjeta blanca con la misma piel que las tarjetas reales. */
export function SkeletonCard({ className = "", children }: Props & { children?: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-8 ${className}`}
    >
      {children ?? (
        <>
          <Skeleton className="h-6 w-1/2" />
          <SkeletonText className="mt-5" />
        </>
      )}
    </div>
  );
}

/** Anuncio para lectores de pantalla mientras algo carga. */
export function LoadingStatus({ label = "Cargando contenido…" }: { label?: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  );
}
