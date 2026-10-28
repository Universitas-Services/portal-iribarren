import { ArrowLeft, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SelloEstado } from "@/components/documentos/sello-estado";
import { urlDocumentos } from "@/components/documentos/urls";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { VisorDocumento } from "@/components/noticias/contenido-noticia";
import { getDocumento, getDocumentoSlugs } from "@/lib/api";
import { usaApi } from "@/lib/plataforma-api/cliente";
import { formatearFechaLarga } from "@/lib/formato";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = (await getDocumentoSlugs()).map(({ slug }) => ({ slug }));
  // Cache Components no admite una lista vacía.
  return slugs.length ? slugs : [{ slug: "sin-documentos" }];
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

        <VisorDocumento adjunto={doc.archivo} descargaUrl={doc.descargaUrl} />

        {/* Solo la versión vigente: el historial de versiones queda para el equipo en el admin. */}
        <p className="text-sm text-tinta/75">
          Publicado el {formatearFechaLarga(doc.publicadoEl)}
          {/* Con la API los documentos son los reales de la alcaldía. */}
          {!usaApi() && " · Documento de ejemplo, sin validez oficial."}
        </p>

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
