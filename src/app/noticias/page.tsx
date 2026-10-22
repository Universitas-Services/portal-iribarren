import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BannerCampana } from "@/components/campana/banner-campana";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { FiltrosNoticias } from "@/components/noticias/filtros-noticias";
import { MosaicoNoticias } from "@/components/noticias/mosaico-noticias";
import { Paginacion } from "@/components/listado/paginacion";
import { TransicionListado, ZonaResultados } from "@/components/listado/transicion";
import { urlPaginaNoticias } from "@/components/noticias/urls";
import { ListadoSkeleton } from "@/components/noticias/skeletons";
import { getPosts } from "@/lib/api";
import { CATEGORIAS } from "@/lib/api/types";
import { plural } from "@/lib/formato";
import { parseFiltrosNoticias } from "@/lib/validation/schemas";

export const metadata: Metadata = {
  title: "Noticias",
  description:
    "Decretos, análisis, mesas de trabajo y avances del Plan de Desarrollo Urbano Local de Iribarren.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/*
 * El encabezado es parte del shell estático; el listado depende de la URL (filtros y página),
 * así que se resuelve dentro de <Suspense> con su skeleton.
 */
export default function NoticiasPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <EncabezadoPagina
        migas={[{ href: "/", label: "Inicio" }, { label: "Noticias" }]}
        titulo="Noticias y novedades"
        bajada="Decretos y normativas, análisis, mesas de trabajo y el avance del diagnóstico de la ciudad."
      />
      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8">
        <Suspense fallback={<ListadoSkeleton />}>
          <Listado searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Listado({ searchParams }: { searchParams: SearchParams }) {
  const filtros = parseFiltrosNoticias(await searchParams);
  const { items, total, pagina, paginas, porFormato } = await getPosts(filtros);
  const hayFiltros = Boolean(
    filtros.q || filtros.categoria || filtros.formato || filtros.desde || filtros.hasta,
  );

  return (
    <TransicionListado>
      <FiltrosNoticias filtros={filtros} categorias={CATEGORIAS} porFormato={porFormato} />
      <ZonaResultados>
        <p className="mt-6 text-sm text-tinta/75" aria-live="polite">
          {total === 0
            ? "Sin resultados"
            : `${plural(total, "noticia", "noticias")}${hayFiltros ? " con estos filtros" : ""}`}
        </p>

        {items.length > 0 ? (
          <div className="mt-6 space-y-8">
            <MosaicoNoticias items={items} />
            <BannerCampana />
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-tarjeta bg-papel px-6 py-16 text-center shadow-tarjeta">
            <span className="grid size-16 place-items-center rounded-full bg-rojo/10 text-rojo">
              <SearchX size={30} aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-noche">
              No hay noticias con esos filtros
            </h2>
            <p className="mt-2 max-w-md leading-relaxed text-tinta">
              Prueba con otras palabras, otra categoría o un rango de fechas más amplio.
            </p>
            <Link
              href="/noticias"
              className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.97]"
            >
              Limpiar filtros
            </Link>
          </div>
        )}

        <Paginacion
          pagina={pagina}
          paginas={paginas}
          href={(n) => urlPaginaNoticias(filtros, n)}
          etiqueta="noticias"
        />
      </ZonaResultados>
    </TransicionListado>
  );
}
