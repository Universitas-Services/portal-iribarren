import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { FichaAporte, InsigniaEstado, LineaTiempoEstados } from "@/components/participacion/aporte";
import { AUTOR_ANONIMO, filasComprobante, tieneSeguimiento } from "@/lib/participacion";
import { getParticipacion, getUsuario } from "@/lib/auth/sesion";
import { formatearFechaHora } from "@/lib/formato";
import { FOLIOS_PRERENDER } from "@/lib/folios";
import { MapaPunto } from "@/components/cuenta/selector-ubicacion";

export const metadata: Metadata = { title: "Detalle de mi aporte", robots: { index: false } };

type Params = Promise<{ folio: string }>;

/** Ver el comentario en /propuestas/[folio]: un folio de muestra para validar la ruta. */
export function generateStaticParams() {
  return FOLIOS_PRERENDER.map((folio) => ({ folio }));
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
        <InsigniaEstado estado={p.estado} tipo={p.tipo} />
      </div>

      {tieneSeguimiento(p.tipo) ? (
        <section aria-labelledby="seguimiento" className="mt-8">
          <h2 id="seguimiento" className="mb-5 font-display text-xl font-extrabold text-noche">
            Seguimiento
          </h2>
          <LineaTiempoEstados historial={p.historial} />
        </section>
      ) : (
        <p className="mt-8 rounded-2xl bg-superficie p-5 leading-relaxed text-tinta">
          {p.estado === "PUBLICADA" ? (
            <>
              El equipo de la alcaldía publicó tu opinión.{" "}
              <Link href={`/propuestas/${p.folio}`} className="font-bold text-rojo underline">
                Verla en Propuestas y opiniones
              </Link>
              .
            </>
          ) : (
            "El equipo de la alcaldía revisa las opiniones y puede publicarlas en Propuestas y opiniones. Las opiniones no tienen seguimiento con respuesta: si la necesitas, presenta una propuesta formal."
          )}
        </p>
      )}

      {p.ubicacion && (
        <section aria-labelledby="ubicacion-aporte" className="mt-10">
          <h2 id="ubicacion-aporte" className="mb-3 font-display text-xl font-extrabold text-noche">
            Ubicación
          </h2>
          <MapaPunto punto={p.ubicacion} />
          <p className="mt-1 text-xs text-tinta/70">
            Solo la ven tú y el equipo de la alcaldía; no se publica.
          </p>
        </section>
      )}

      <div className="mt-10">
        <FichaAporte
          aporte={p}
          titulo="Lo que enviaste"
          extra={[
            ["Enviado", formatearFechaHora(p.creadaEl)],
            [
              "Nombre público",
              p.mostrarNombre ? "Sí, con tu nombre" : `No, como «${AUTOR_ANONIMO}»`,
            ],
            ...filasComprobante(p.comprobante),
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
