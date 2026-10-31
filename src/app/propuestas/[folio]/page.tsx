import { rutaPublica } from "@/lib/participacion";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { FichaAporte } from "@/components/participacion/aporte";
import { Reacciones } from "@/components/participacion/reacciones";
import { Skeleton } from "@/components/ui/skeleton";
import { NOMBRE_TIPO_PARTICIPACION } from "@/lib/api/types";
import { getPropuestaPublica } from "@/lib/auth/sesion";
import { formatearFechaHora } from "@/lib/formato";
import { FOLIOS_PRERENDER } from "@/lib/folios";

type Params = Promise<{ folio: string }>;

/*
 * Con Cache Components, una ruta dinámica declara al menos un parámetro para validar su
 * estructura en el build. Se prerenderiza solo la estructura; la propuesta se lee al pedirla.
 */
export function generateStaticParams() {
  return FOLIOS_PRERENDER.map((folio) => ({ folio }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { folio } = await params;
  return { title: `Aporte ciudadano ${decodeURIComponent(folio).toUpperCase()}` };
}

/**
 * Detalle público de una propuesta u opinión publicada, con sus vistas y reacciones: sin datos
 * de contacto ni de identidad.
 */
export default function PropuestaPage({ params }: { params: Params }) {
  return (
    <>
      <EncabezadoPagina
        migas={[
          { href: "/", label: "Inicio" },
          { href: "/propuestas", label: "Propuestas y opiniones" },
          { label: "Detalle" },
        ]}
        titulo="Aporte ciudadano"
      />
      <div className="relative z-10 mx-auto -mt-16 max-w-3xl px-4 pb-24 sm:px-6 lg:-mt-20">
        <div className="rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-10">
          <Suspense
            fallback={
              <div aria-hidden="true" className="space-y-4">
                <Skeleton className="h-10 w-56" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
            }
          >
            <Contenido params={params} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function Contenido({ params }: { params: Params }) {
  const { folio } = await params;
  const p = await getPropuestaPublica(decodeURIComponent(folio));

  if (!p) {
    return (
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold text-noche">
          Este aporte no está publicado
        </h2>
        <p className="mt-2 text-tinta">
          Puede que el folio no exista o que el aporte no se haya publicado.
        </p>
        <Link
          href="/propuestas"
          className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rojo px-6 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          Ver propuestas y opiniones
        </Link>
      </div>
    );
  }

  return (
    <article>
      <p className="text-sm font-semibold tracking-wide text-tinta/80 uppercase">
        {NOMBRE_TIPO_PARTICIPACION[p.tipo]} · {p.parroquia}
      </p>
      <h2 className="mt-1 font-display text-3xl font-extrabold text-noche tabular-nums">
        {p.folio}
      </h2>
      <p className="mt-2 text-tinta">
        {p.autor && (
          <>
            Por <strong className="text-noche">{p.autor}</strong> ·{" "}
          </>
        )}
        Publicado el <time dateTime={p.publicadaEl}>{formatearFechaHora(p.publicadaEl)}</time>
      </p>

      <div className="mt-8">
        <FichaAporte aporte={p} base={rutaPublica(p.folio)} titulo="El aporte" />
      </div>

      <div className="mt-8">
        <Reacciones
          objetivo={{ tipo: "aporte", folio: p.folio }}
          volver={`/propuestas/${p.folio}`}
          etiqueta="Reacciones a este aporte"
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/propuestas"
          className="inline-flex min-h-11 items-center gap-2 font-display font-bold text-rojo hover:underline"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Volver a propuestas y opiniones
        </Link>
        <Link
          href="/participa"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          <MessageSquareText size={18} aria-hidden="true" />
          Enviar mi propuesta
        </Link>
      </div>
    </article>
  );
}
