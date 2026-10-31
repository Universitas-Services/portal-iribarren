import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { TarjetaAporte } from "@/components/participacion/aporte";
import type { PropuestaPublica } from "@/lib/auth/servicio";
import { getPropuestasPublicadas } from "@/lib/auth/sesion";
import { almacenInteracciones, metricasAporte } from "@/lib/interacciones/almacen";
import { rankingAportesApi } from "@/lib/interacciones/api";
import { claveAporte, masReacciones, masVistas } from "@/lib/interacciones/interacciones";
import { ErrorApi, usaApi } from "@/lib/plataforma-api/cliente";
import { PestanasNoticias } from "./pestanas-noticias";

const POR_PESTANA = 6;
const LECTOR = {
  clave: (p: PropuestaPublica) => claveAporte(p.folio),
  fecha: (p: PropuestaPublica) => p.publicadaEl,
};

type Pestanas = { vistas: PropuestaPublica[]; reacciones: PropuestaPublica[] };

/**
 * Las dos pestañas. Con plataforma-api, los rankings de la API (guía R12), cacheados unos
 * minutos. Sin ella, el almacén simulado, que cambia con cada visita: se lee al pedir la página.
 */
async function pestanas(): Promise<Pestanas | null> {
  if (usaApi()) {
    try {
      const [vistas, reacciones] = await Promise.all([
        rankingAportesApi("vistas", POR_PESTANA),
        rankingAportesApi("reacciones", POR_PESTANA),
      ]);
      return { vistas, reacciones };
    } catch (e) {
      // Si la API no responde, el Inicio sigue sin esta sección.
      if (e instanceof ErrorApi && e.status >= 500) return null;
      throw e;
    }
  }
  await connection();
  const publicadas = (await getPropuestasPublicadas({}, 1, 100)).items;
  const alm = almacenInteracciones();
  return {
    vistas: masVistas(alm, publicadas, LECTOR, POR_PESTANA),
    reacciones: masReacciones(alm, publicadas, LECTOR, POR_PESTANA),
  };
}

/**
 * «La gente opina»: propuestas y opiniones de la ciudadanía que la alcaldía publicó, ordenadas
 * por vistas o por cantidad de reacciones. Sin aportes publicados no se muestra.
 */
export async function LaGenteOpina() {
  const p = await pestanas();
  if (!p || p.vistas.length === 0) return null;

  const tarjetas = (aportes: PropuestaPublica[]) => (
    <>
      {aportes.map((a) => (
        <li key={a.folio} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <TarjetaAporte
            href={`/propuestas/${a.folio}`}
            folio={a.folio}
            tipo={a.tipo}
            parroquia={a.parroquia}
            categoriaTecnica={a.categoriaTecnica}
            descripcion={a.descripcion}
            fecha={a.publicadaEl}
            autor={a.autor}
            metricas={metricasAporte(a.folio, a.totales)}
          />
        </li>
      ))}
      <li className="w-[70%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
        <Link
          href="/propuestas"
          className="group flex h-full min-h-56 flex-col justify-between rounded-tarjeta border-2 border-dashed border-rojo/40 p-6 font-display text-enlace transition-[background-color,border-color] duration-200 hover:border-rojo hover:bg-rojo/5"
        >
          <span className="text-2xl leading-tight font-extrabold">
            Ver todas las propuestas y opiniones
          </span>
          <ArrowRight
            size={28}
            aria-hidden="true"
            className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1.5"
          />
        </Link>
      </li>
    </>
  );

  return (
    <section aria-labelledby="gente-opina-titulo" className="revelar">
      <h2
        id="gente-opina-titulo"
        className="font-display text-3xl font-extrabold text-fuerte sm:text-4xl"
      >
        La gente opina
      </h2>
      <p className="mt-2 text-tinta/80">
        Propuestas y opiniones de la ciudadanía publicadas por la alcaldía.
      </p>
      <PestanasNoticias
        etiqueta="Ordenar aportes"
        pestanas={[
          { id: "vistas", etiqueta: "Más vistas", contenido: tarjetas(p.vistas) },
          { id: "reacciones", etiqueta: "Más reacciones", contenido: tarjetas(p.reacciones) },
        ]}
      />
    </section>
  );
}
