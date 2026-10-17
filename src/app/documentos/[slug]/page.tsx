import { ArrowLeft, History, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SelloEstado } from "@/components/documentos/sello-estado";
import { urlDocumentos } from "@/components/documentos/urls";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { VisorDocumento } from "@/components/noticias/contenido-noticia";
import { getDocumento, getDocumentoSlugs } from "@/lib/api";
import { formatearFechaLarga } from "@/lib/formato";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getDocumentoSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const doc = await getDocumento((await params).slug);
  if (!doc) return { title: "Documento no encontrado" };
  return { title: doc.titulo, description: doc.descripcion };
}

export default async function DocumentoPage({ params }: { params: Params }) {
  const doc = await getDocumento((await params).slug);
  if (!doc) notFound();

  return (
    <>
      <EncabezadoPagina
        ancho="max-w-4xl"
        migas={[
          { href: "/", label: "Inicio" },
          { href: "/documentos", label: "Documentos" },
          { label: doc.categoria },
        ]}
        titulo={doc.titulo}
        bajada={doc.descripcion}
      >
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-papel/80">
          <SelloEstado estado={doc.estado} className="bg-papel ring-0" />
          <Link
            href={urlDocumentos({ categoria: doc.categoria })}
            className="font-semibold text-papel hover:underline"
          >
            {doc.categoria}
          </Link>
          <span aria-hidden="true">·</span>
          <span>Versión {doc.version}</span>
        </p>
      </EncabezadoPagina>

      <div className="relative z-10 mx-auto -mt-16 max-w-4xl space-y-8 px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8">
        {doc.estado === "BORRADOR" && (
          <p
            role="note"
            className="flex items-start gap-3 rounded-tarjeta bg-[color-mix(in_srgb,var(--color-amarillo)_22%,white)] p-5 text-noche shadow-tarjeta ring-1 ring-amarillo/60 ring-inset"
          >
            <TriangleAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-display">Borrador de trabajo.</strong> Este documento puede
              cambiar antes de ser oficializado; revisa la versión y la fecha antes de citarlo.
            </span>
          </p>
        )}

        <VisorDocumento adjunto={doc.archivo} />

        <section
          aria-labelledby="historial"
          className="rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-8"
        >
          <h2
            id="historial"
            className="flex items-center gap-2 font-display text-xl font-extrabold text-noche"
          >
            <History size={20} aria-hidden="true" className="text-rojo" />
            Historial de versiones
          </h2>
          <ol className="mt-6 space-y-6 border-l-2 border-linea pl-6">
            {doc.versiones.map((v, i) => (
              <li key={v.version} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute top-1 -left-[2.1rem] size-4 rounded-full ring-4 ring-papel ${
                    i === 0 ? "bg-rojo" : "bg-linea"
                  }`}
                />
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-display font-extrabold text-noche">
                    Versión {v.version}
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-rojo/10 px-2 py-0.5 font-display text-xs font-bold text-rojo">
                      Vigente
                    </span>
                  )}
                  <time dateTime={v.fecha} className="text-sm text-tinta/75">
                    {formatearFechaLarga(v.fecha)}
                  </time>
                </p>
                <p className="mt-1 text-tinta">{v.nota}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-tinta/75">
            Publicado el {formatearFechaLarga(doc.publicadoEl)} · Documento de ejemplo, sin validez
            oficial.
          </p>
        </section>

        <Link
          href="/documentos"
          className="inline-flex min-h-11 items-center gap-2 font-display font-bold text-rojo hover:underline"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Volver al repositorio
        </Link>
      </div>
    </>
  );
}
