import { MessageSquareText, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalogo } from "@/lib/api";
import { soloDeLista } from "@/lib/catalogos";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { FiltrosUrl, type CampoFiltro } from "@/components/listado/filtros-url";
import { Paginacion } from "@/components/listado/paginacion";
import { TransicionListado, ZonaResultados } from "@/components/listado/transicion";
import { TarjetaAporte } from "@/components/participacion/aporte";
import { Skeleton } from "@/components/ui/skeleton";
import { NOMBRE_TIPO_PARTICIPACION, TIPOS_PARTICIPACION } from "@/lib/api/types";
import { getPropuestasPublicadas } from "@/lib/auth/sesion";
import { usaApi } from "@/lib/plataforma-api/cliente";
import { plural } from "@/lib/formato";
import { metricasAporte } from "@/lib/interacciones/almacen";
import {
  aSlug,
  filtrosParticipacionesSchema,
  type FiltrosParticipaciones,
} from "@/lib/validation/schemas";
import { BannerCampana } from "@/components/campana/banner-campana";

export const metadata: Metadata = {
  title: "Propuestas y opiniones",
  description:
    "Propuestas y opiniones ciudadanas publicadas por la Alcaldía para el Plan de Desarrollo Urbano Local de Iribarren.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Los filtros, con los desplegables vigentes de la alcaldía. */
const camposDe = (parroquias: string[], categoriasTecnicas: string[]): CampoFiltro[] => [
  { tipo: "texto", nombre: "q", etiqueta: "Buscar", placeholder: "Tema, sector o autor" },
  {
    tipo: "selector",
    nombre: "tipo",
    etiqueta: "Tipo",
    vacio: "Todos",
    opciones: TIPOS_PARTICIPACION.map((t) => ({
      valor: aSlug(t),
      texto: NOMBRE_TIPO_PARTICIPACION[t],
    })),
  },
  {
    tipo: "selector",
    nombre: "parroquia",
    etiqueta: "Parroquia",
    vacio: "Todas",
    opciones: parroquias,
  },
  {
    tipo: "selector",
    nombre: "categoriaTecnica",
    etiqueta: "Categoría técnica",
    vacio: "Todas",
    opciones: categoriasTecnicas,
  },
];

function urlPagina(f: FiltrosParticipaciones, pagina: number) {
  const qs = new URLSearchParams();
  if (f.q) qs.set("q", f.q);
  if (f.tipo) qs.set("tipo", aSlug(f.tipo));
  if (f.parroquia) qs.set("parroquia", f.parroquia);
  if (f.categoriaTecnica) qs.set("categoriaTecnica", f.categoriaTecnica);
  if (pagina > 1) qs.set("pagina", String(pagina));
  const s = qs.toString();
  return s ? `/propuestas?${s}` : "/propuestas";
}

/** Backlog 3.12: galería pública de los aportes aprobados y publicados (v3, 5.1). */
export default function PropuestasPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <EncabezadoPagina
        migas={[{ href: "/", label: "Inicio" }, { label: "Propuestas" }]}
        titulo="Propuestas y opiniones"
        bajada="Propuestas y opiniones de la ciudadanía que el equipo de la alcaldía eligió publicar. Cada autor decide si aparece su nombre."
      />
      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8">
        <Suspense fallback={<GaleriaSkeleton />}>
          <Galeria searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Galeria({ searchParams }: { searchParams: SearchParams }) {
  const [parroquias, categoriasTecnicas] = await Promise.all([
    getCatalogo("parroquias"),
    getCatalogo("categorias-tecnicas"),
  ]);
  const filtros = soloDeLista(
    soloDeLista(filtrosParticipacionesSchema.parse(await searchParams), "parroquia", parroquias),
    "categoriaTecnica",
    categoriasTecnicas,
  );
  const { items, total, pagina, paginas } = await getPropuestasPublicadas(
    {
      q: filtros.q,
      tipo: filtros.tipo,
      parroquia: filtros.parroquia,
      categoriaTecnica: filtros.categoriaTecnica,
    },
    filtros.pagina,
  );
  const hayFiltros = Boolean(
    filtros.q || filtros.tipo || filtros.parroquia || filtros.categoriaTecnica,
  );

  return (
    <TransicionListado>
      <FiltrosUrl
        ruta="/propuestas"
        campos={camposDe(parroquias, categoriasTecnicas)}
        valores={{
          q: filtros.q ?? "",
          tipo: filtros.tipo ? aSlug(filtros.tipo) : "",
          parroquia: filtros.parroquia ?? "",
          categoriaTecnica: filtros.categoriaTecnica ?? "",
        }}
        etiqueta="Filtrar propuestas y opiniones"
      />
      <ZonaResultados>
        <p className="mt-6 text-sm text-tinta/75" aria-live="polite">
          {total === 0
            ? "Sin resultados"
            : `${plural(total, "aporte publicado", "aportes publicados")}${hayFiltros ? " con estos filtros" : ""}`}
          {!usaApi() && <span className="text-tinta/75"> · Aportes de ejemplo</span>}
        </p>

        {items.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.folio}>
                <TarjetaAporte
                  href={`/propuestas/${p.folio}`}
                  folio={p.folio}
                  tipo={p.tipo}
                  parroquia={p.parroquia}
                  categoriaTecnica={p.categoriaTecnica}
                  descripcion={p.descripcion}
                  fecha={p.publicadaEl}
                  metricas={metricasAporte(p.folio)}
                  autor={p.autor}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-tarjeta bg-papel px-6 py-16 text-center shadow-tarjeta">
            <span className="grid size-16 place-items-center rounded-full bg-rojo/10 text-rojo">
              <SearchX size={30} aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-noche">
              {hayFiltros
                ? "No hay propuestas con esos filtros"
                : "Aún no hay propuestas publicadas"}
            </h2>
            <p className="mt-2 max-w-md leading-relaxed text-tinta">
              {hayFiltros
                ? "Prueba con otras palabras, otra parroquia u otra categoría."
                : "Las propuestas y opiniones aparecen aquí cuando el equipo de la alcaldía las publica."}
            </p>
          </div>
        )}

        <BannerCampana className="mt-8" />

        <Paginacion
          pagina={pagina}
          paginas={paginas}
          href={(n) => urlPagina(filtros, n)}
          etiqueta="propuestas"
        />
      </ZonaResultados>

      <section
        aria-labelledby="sumate"
        className="mt-12 flex flex-col items-start gap-4 rounded-tarjeta bg-noche p-6 text-papel shadow-tarjeta sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <h2 id="sumate" className="font-display text-xl font-extrabold">
            ¿Tienes una idea para tu parroquia?
          </h2>
          <p className="mt-1 text-papel/80">Envíala con su folio y sigue su revisión.</p>
        </div>
        <Link
          href="/participa"
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          <MessageSquareText size={18} aria-hidden="true" />
          Participar
        </Link>
      </section>
    </TransicionListado>
  );
}

function GaleriaSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-36 rounded-tarjeta" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-tarjeta" />
        ))}
      </div>
    </div>
  );
}
