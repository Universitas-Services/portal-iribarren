import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { FichaAporte, InsigniaEstado, LineaTiempoEstados } from "@/components/participacion/aporte";
import { getParticipacion, getUsuario } from "@/lib/auth/sesion";
import { formatearFechaHora } from "@/lib/formato";

export const metadata: Metadata = { title: "Detalle de mi aporte", robots: { index: false } };

type Params = Promise<{ folio: string }>;

/** Ver el comentario en /propuestas/[folio]: un folio de muestra para validar la ruta. */
export function generateStaticParams() {
  return [{ folio: "IRI-2026-0001" }];
}

/** Backlog 3.11: detalle con la línea de tiempo de estados; sin editar ni eliminar. */
export default function DetalleParticipacionPage({ params }: { params: Params }) {
  return (
    <MarcoCuenta
      migas={[
        { href: "/", label: "Inicio" },
        { href: "/mi-cuenta/participaciones", label: "Mis participaciones" },
        { label: "Detalle" },
      ]}
      titulo="Detalle de mi aporte"
      ancho="max-w-3xl"
    >
      <Suspense fallback={<FormularioSkeleton campos={4} />}>
        <Contenido params={params} />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido({ params }: { params: Params }) {
  const { folio } = await params;
  const u = await getUsuario();
  if (!u) redirect(`/ingresar?volver=/mi-cuenta/participaciones/${encodeURIComponent(folio)}`);
  const p = await getParticipacion(decodeURIComponent(folio).toUpperCase());

  if (!p) {
    return (
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold text-noche">
          No encontramos ese folio
        </h2>
        <p className="mt-2 text-tinta">Solo puedes ver los aportes enviados desde tu cuenta.</p>
        <Link
          href="/mi-cuenta/participaciones"
          className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rojo px-6 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          Ver mis participaciones
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-wide text-tinta/80 uppercase">Folio</p>
          <p className="font-display text-3xl font-extrabold text-noche tabular-nums sm:text-4xl">
            {p.folio}
          </p>
        </div>
        <InsigniaEstado estado={p.estado} />
      </div>

      <section aria-labelledby="seguimiento" className="mt-8">
        <h2 id="seguimiento" className="mb-5 font-display text-xl font-extrabold text-noche">
          Seguimiento
        </h2>
        <LineaTiempoEstados historial={p.historial} />
      </section>

      <div className="mt-10">
        <FichaAporte
          aporte={p}
          titulo="Lo que enviaste"
          extra={[
            ["Enviado", formatearFechaHora(p.creadaEl)],
            ["Nombre público", p.mostrarNombre ? "Autorizado" : "No autorizado"],
          ]}
          pie="Los aportes quedan registrados tal como se enviaron: no se pueden editar ni eliminar."
        />
      </div>

      <Link
        href="/mi-cuenta/participaciones"
        className="mt-8 inline-flex min-h-11 items-center gap-2 font-display font-bold text-rojo hover:underline"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a mis participaciones
      </Link>
    </div>
  );
}
