import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { TarjetaAporte } from "@/components/participacion/aporte";
import { propuestasPublicadas, type PropuestaPublica } from "@/lib/auth/servicio";
import { almacen } from "@/lib/auth/sesion";
import { almacenInteracciones, metricasAporte } from "@/lib/interacciones/almacen";
import { claveAporte, masReacciones, masVistas } from "@/lib/interacciones/interacciones";
import { PestanasNoticias } from "./pestanas-noticias";

const POR_PESTANA = 6;
const LECTOR = {
  clave: (p: PropuestaPublica) => claveAporte(p.folio),
  fecha: (p: PropuestaPublica) => p.publicadaEl,
};

/**
 * «La gente opina»: propuestas y opiniones de la ciudadanía que la alcaldía publicó, ordenadas
 * por vistas o por cantidad de reacciones. Los contadores cambian con cada visita: se leen al
 * pedir la página. Sin aportes publicados no se muestra.
 */
export async function LaGenteOpina() {
  await connection();
  const publicadas = propuestasPublicadas(almacen());
  if (publicadas.length === 0) return null;
  const alm = almacenInteracciones();

  const tarjetas = (aportes: PropuestaPublica[]) => (
    <>
      {aportes.map((p) => (
        <li key={p.folio} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <TarjetaAporte
            href={`/propuestas/${p.folio}`}
            folio={p.folio}
            tipo={p.tipo}
            parroquia={p.parroquia}
            categoriaTecnica={p.categoriaTecnica}
            descripcion={p.descripcion}
            fecha={p.publicadaEl}
            autor={p.autor}
            metricas={metricasAporte(p.folio)}
          />
        </li>
      ))}
      <li className="w-[70%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
        <Link
          href="/propuestas"
          className="group flex h-full min-h-56 flex-col justify-between rounded-tarjeta border-2 border-dashed border-rojo/40 p-6 font-display text-rojo transition-[background-color,border-color] duration-200 hover:border-rojo hover:bg-rojo/5"
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
        className="font-display text-3xl font-extrabold text-noche sm:text-4xl"
      >
        La gente opina
      </h2>
      <p className="mt-2 text-tinta/80">
        Propuestas y opiniones de la ciudadanía publicadas por la alcaldía.
      </p>
      <PestanasNoticias
        etiqueta="Ordenar aportes"
        pestanas={[
          {
            id: "vistas",
            etiqueta: "Más vistas",
            contenido: tarjetas(masVistas(alm, publicadas, LECTOR, POR_PESTANA)),
          },
          {
            id: "reacciones",
            etiqueta: "Más reacciones",
            contenido: tarjetas(masReacciones(alm, publicadas, LECTOR, POR_PESTANA)),
          },
        ]}
      />
    </section>
  );
}
