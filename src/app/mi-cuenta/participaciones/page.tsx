import { Inbox, MessageSquareText, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { FiltrosUrl, type CampoFiltro } from "@/components/listado/filtros-url";
import { TransicionListado, ZonaResultados } from "@/components/listado/transicion";
import { TarjetaAporte } from "@/components/participacion/aporte";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ESTADOS_PARTICIPACION,
  NOMBRE_TIPO_PARTICIPACION,
  TIPOS_PARTICIPACION,
} from "@/lib/api/types";
import { getMisParticipaciones } from "@/lib/auth/sesion";
import { plural } from "@/lib/formato";
import { ESTADO_PARTICIPACION } from "@/lib/participacion";
import { aSlug, filtrosParticipacionesSchema } from "@/lib/validation/schemas";

export const metadata: Metadata = { title: "Mis participaciones", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const CAMPOS: CampoFiltro[] = [
  {
    tipo: "texto",
    nombre: "folio",
    etiqueta: "Buscar por folio",
    placeholder: "IRI-2026-0045 o 45",
    maxLength: 20,
  },
  {
    tipo: "selector",
    nombre: "estado",
    etiqueta: "Estado",
    vacio: "Todos",
    opciones: ESTADOS_PARTICIPACION.map((e) => ({
      valor: aSlug(e),
      texto: ESTADO_PARTICIPACION[e].texto,
      detalle: ESTADO_PARTICIPACION[e].ayuda,
    })),
  },
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
];

/** Backlog 3.11: seguimiento de los aportes propios, con filtros y búsqueda por folio. */
export default function MisParticipacionesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <EncabezadoPagina
        migas={[
          { href: "/", label: "Inicio" },
          { href: "/mi-cuenta", label: "Mi cuenta" },
          { label: "Mis participaciones" },
        ]}
        titulo="Mis participaciones"
        bajada="Cada aporte que enviaste, con su folio y el estado de su revisión."
      />
      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 pb-24 sm:px-6 lg:-mt-20 lg:px-8">
        <Suspense fallback={<ListadoSkeleton />}>
          <Listado searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Listado({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filtros = filtrosParticipacionesSchema.parse(sp);
  const r = await getMisParticipaciones(filtros);
  if (!r) redirect("/ingresar?volver=/mi-cuenta/participaciones");
  const valores = {
    folio: filtros.folio ?? "",
    estado: filtros.estado ? aSlug(filtros.estado) : "",
    tipo: filtros.tipo ? aSlug(filtros.tipo) : "",
  };

  if (r.total === 0) {
    return (
      <Vacio
        Icon={Inbox}
        titulo="Aún no has enviado aportes"
        texto="Cuando envíes una opinión o una propuesta, la verás aquí con su folio y el estado de su revisión."
      />
    );
  }

  return (
    <TransicionListado>
      <FiltrosUrl
        ruta="/mi-cuenta/participaciones"
        campos={CAMPOS}
        valores={valores}
        etiqueta="Filtrar mis participaciones"
        columnas="sm:grid-cols-3"
      />
      <ZonaResultados>
        <p className="mt-6 text-sm text-tinta/75" aria-live="polite">
          {r.items.length === r.total
            ? plural(r.total, "aporte", "aportes")
            : `${r.items.length} de ${plural(r.total, "aporte", "aportes")}`}
        </p>
        {r.items.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {r.items.map((p) => (
              <li key={p.folio}>
                <TarjetaAporte
                  href={`/mi-cuenta/participaciones/${p.folio}`}
                  folio={p.folio}
                  tipo={p.tipo}
                  parroquia={p.parroquia}
                  categoriaTecnica={p.categoriaTecnica}
                  descripcion={p.descripcion}
                  fecha={p.creadaEl}
                  estado={p.estado}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Vacio
            Icon={SearchX}
            titulo="Ningún aporte coincide"
            texto="Revisa el número de folio o quita algún filtro."
            sinBoton
          />
        )}
      </ZonaResultados>
    </TransicionListado>
  );
}

function Vacio({
  Icon,
  titulo,
  texto,
  sinBoton = false,
}: {
  Icon: typeof Inbox;
  titulo: string;
  texto: string;
  sinBoton?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-tarjeta bg-papel px-6 py-16 text-center shadow-tarjeta first:mt-0">
      <span className="grid size-16 place-items-center rounded-full bg-rojo/10 text-rojo">
        <Icon size={30} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold text-noche">{titulo}</h2>
      <p className="mt-2 max-w-md leading-relaxed text-tinta">{texto}</p>
      {!sinBoton && (
        <Link
          href="/participa"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-rojo px-6 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          <MessageSquareText size={18} aria-hidden="true" />
          Participar
        </Link>
      )}
    </div>
  );
}

function ListadoSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-36 rounded-tarjeta" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-52 rounded-tarjeta" />
        ))}
      </div>
    </div>
  );
}
