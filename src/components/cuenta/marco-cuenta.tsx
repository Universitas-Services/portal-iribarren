import type { ReactNode } from "react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { PestanasCuenta, type PestanaCuenta } from "./pestanas-cuenta";

/**
 * Marco de las pantallas de cuenta: la banda oscura de las páginas internas y una tarjeta
 * angosta superpuesta, cómoda para leer y llenar formularios en el teléfono.
 */
export function MarcoCuenta({
  titulo,
  bajada,
  migas,
  children,
  ancho = "max-w-xl",
  pestana,
}: {
  titulo: string;
  bajada?: ReactNode;
  migas: { href?: string; label: string }[];
  children: ReactNode;
  ancho?: string;
  /** En las secciones de «Mi cuenta», la pestaña activa. */
  pestana?: PestanaCuenta;
}) {
  return (
    <>
      <EncabezadoPagina ancho="max-w-3xl" migas={migas} titulo={titulo} bajada={bajada} />
      <div className={`relative z-10 mx-auto -mt-16 px-4 pb-24 sm:px-6 lg:-mt-20 ${ancho}`}>
        {pestana && <PestanasCuenta activa={pestana} />}
        <div className="rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-10">{children}</div>
      </div>
    </>
  );
}

/** Skeleton de las pantallas de cuenta (formulario de varios campos). */
export function FormularioSkeleton({ campos = 4 }: { campos?: number }) {
  return (
    <div aria-hidden="true" className="space-y-5">
      {Array.from({ length: campos }, (_, i) => (
        <div key={i}>
          <div className="skeleton h-4 w-28 rounded-full" />
          <div className="skeleton mt-2 h-12 rounded-xl" />
        </div>
      ))}
      <div className="skeleton h-12 rounded-xl" />
    </div>
  );
}
