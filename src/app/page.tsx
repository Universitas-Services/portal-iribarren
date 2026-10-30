import { Suspense } from "react";
import { ActorsSection } from "@/components/home/actors-section";
import { BannersTile } from "@/components/home/banners-tile";
import { Hero } from "@/components/home/hero";
import { getHome } from "@/lib/api";
import { ACTORES_INICIAL, ENCABEZADO_INICIAL, fotoDelEncabezado } from "@/lib/sitio";
import { LaGenteOpina } from "@/components/home/la-gente-opina";
import { NewsRail } from "@/components/home/news-rail";
import {
  BannersSkeleton,
  NewsRailSkeleton,
  ThermometerSkeleton,
} from "@/components/home/skeletons";
import {
  AccessTile,
  CampanaTile,
  MayorTile,
  MensajeAlcaldeTile,
  OpinionTile,
} from "@/components/home/static-tiles";
import { ThermometerTile } from "@/components/home/thermometer-tile";
import { ValuesSection } from "@/components/home/values-section";

/*
 * Inicio: hero de la guía y, montado sobre él, un tablero bento donde conviven el avance,
 * la participación, los anuncios y los accesos. Cada bloque con datos carga por separado
 * (streaming) y muestra su propio skeleton.
 */
export default function HomePage() {
  const termometro = "md:col-span-6 lg:col-span-8";
  const anuncios = "md:col-span-6 lg:col-span-7 lg:row-span-2";

  return (
    <>
      <HeroDelInicio />

      <div className="relative z-10 mx-auto -mt-24 max-w-7xl px-4 sm:px-6 lg:-mt-32 lg:px-8">
        <div className="grid grid-flow-dense gap-4 md:grid-cols-6 lg:grid-cols-12 lg:gap-5">
          <Suspense fallback={<ThermometerSkeleton className={termometro} />}>
            <ThermometerTile className={termometro} />
          </Suspense>
          <OpinionTile className="md:col-span-3 lg:col-span-4" />
          <Suspense fallback={<BannersSkeleton className={anuncios} />}>
            <BannersTile className={anuncios} />
          </Suspense>
          <AccessTile className="md:col-span-3 lg:col-span-5" />
          <Suspense fallback={<MayorTile className="md:col-span-6 lg:col-span-5" />}>
            <MensajeAlcaldeTile className="md:col-span-6 lg:col-span-5" />
          </Suspense>
          <CampanaTile className="md:col-span-6 lg:col-span-12" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 pt-12 pb-20 sm:px-6 lg:space-y-16 lg:px-8 lg:pt-16">
        {/* Noticias y «La gente opina» van juntas: el carril ya deja aire bajo las tarjetas. */}
        <div className="space-y-6 lg:space-y-8">
          <Suspense fallback={<NewsRailSkeleton />}>
            <NewsRail />
          </Suspense>
          <Suspense fallback={<NewsRailSkeleton />}>
            <LaGenteOpina />
          </Suspense>
        </div>
        <ActoresDelInicio />
        <ValuesSection />
      </div>
    </>
  );
}

/** El encabezado que eligió la alcaldía (R17); sin elegir, el de siempre. Va cacheado. */
async function HeroDelInicio() {
  const { encabezado } = await getHome();
  const e = encabezado ?? ENCABEZADO_INICIAL;
  const fotos = e.fotos.length ? e.fotos : ENCABEZADO_INICIAL.fotos;
  return <Hero fotos={fotos.map(fotoDelEncabezado)} textos={e} />;
}

async function ActoresDelInicio() {
  const { actores } = await getHome();
  return <ActorsSection actores={actores ?? ACTORES_INICIAL} />;
}
