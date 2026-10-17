import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <EncabezadoPagina
        migas={[
          { href: "/", label: "Inicio" },
          { href: "/mi-cuenta", label: "Mi cuenta" },
          { label: "Mis participaciones" },
        ]}
        titulo="Mis participaciones"
      />
      <div
        aria-hidden="true"
        className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8"
      >
        <Skeleton className="h-36 rounded-tarjeta" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-tarjeta" />
          ))}
        </div>
      </div>
    </>
  );
}
