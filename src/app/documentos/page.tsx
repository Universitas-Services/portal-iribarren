import { FileSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilaDocumento } from "@/components/documentos/fila-documento";
import { FiltrosDocumentos } from "@/components/documentos/filtros-documentos";
import { RepositorioSkeleton } from "@/components/documentos/skeletons";
import { urlDocumentos } from "@/components/documentos/urls";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { Paginacion } from "@/components/listado/paginacion";
import { TransicionListado, ZonaResultados } from "@/components/listado/transicion";
import { getDocumentos } from "@/lib/api";
import { plural } from "@/lib/formato";
import { parseFiltrosDocumentos } from "@/lib/validation/schemas";
import { BannerCampana } from "@/components/campana/banner-campana";

export const metadata: Metadata = {
  title: "Documentos",
  description:
    "Repositorio del PDUL de Iribarren: decretos, plan de trabajo, informes técnicos, cartografía y minutas en PDF.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function DocumentosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <EncabezadoPagina
        migas={[{ href: "/", label: "Inicio" }, { label: "Documentos" }]}
        titulo="Documentos del PDUL"
        bajada="Consulta y descarga los decretos, el plan de trabajo, los informes técnicos y las minutas. Cada documento indica si es oficial o un borrador de trabajo."
      />
      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8">
        <Suspense fallback={<RepositorioSkeleton />}>
          <Repositorio searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Repositorio({ searchParams }: { searchParams: SearchParams }) {
  const filtros = parseFiltrosDocumentos(await searchParams);
  const { items, total, pagina, paginas, porCategoria, porEstado } = await getDocumentos(filtros);
  const hayFiltros = Boolean(filtros.q || filtros.categoria || filtros.estado);

  return (
    <TransicionListado>
      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <FiltrosDocumentos filtros={filtros} porCategoria={porCategoria} porEstado={porEstado} />
        </aside>

        <ZonaResultados>
          <p className="text-sm text-tinta/75 lg:pt-1 lg:text-papel/85" aria-live="polite">
            {total === 0
              ? "Sin resultados"
              : `${plural(total, "documento", "documentos")}${hayFiltros ? " con estos filtros" : ""}`}
            <span className="text-tinta/75 lg:text-papel/75"> · Documentos de ejemplo</span>
          </p>

          {items.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {items.map((d) => (
                <li key={d.slug} className="revelar">
                  <FilaDocumento documento={d} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-tarjeta bg-papel px-6 py-16 text-center shadow-tarjeta">
              <span className="grid size-16 place-items-center rounded-full bg-rojo/10 text-rojo">
                <FileSearch size={30} aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-noche">
                No hay documentos con esos filtros
              </h2>
              <p className="mt-2 max-w-md leading-relaxed text-tinta">
                Prueba con otras palabras, otra categoría o muestra oficiales y borradores.
              </p>
              <Link
                href="/documentos"
                className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.97]"
              >
                Limpiar filtros
              </Link>
            </div>
          )}

          <BannerCampana className="mt-8" />

          <Paginacion
            pagina={pagina}
            paginas={paginas}
            href={(n) => urlDocumentos(filtros, n)}
            etiqueta="documentos"
          />
        </ZonaResultados>
      </div>
    </TransicionListado>
  );
}
