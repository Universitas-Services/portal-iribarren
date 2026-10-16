import { Suspense } from "react";
import { ActorsSection } from "@/components/home/actors-section";
import { BannersTile } from "@/components/home/banners-tile";
import { Hero, type Foto } from "@/components/home/hero";
import { NewsRail } from "@/components/home/news-rail";
import {
  BannersSkeleton,
  NewsRailSkeleton,
  ThermometerSkeleton,
} from "@/components/home/skeletons";
import { AccessTile, MayorTile, OpinionTile } from "@/components/home/static-tiles";
import { ThermometerTile } from "@/components/home/thermometer-tile";
import { ValuesSection } from "@/components/home/values-section";

const FOTO_HERO: Foto = {
  src: "/fotos/catedral-metropolitana.jpg",
  autor: "Rube96pinto, Wikimedia Commons",
  licencia: {
    nombre: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
  },
  fuente:
    "https://commons.wikimedia.org/wiki/File:Santa_Iglesia_Catedral_Metropolitana,_Catedral_de_Barquisimeto.jpg",
};

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
      <Hero foto={FOTO_HERO} />

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
          <MayorTile className="md:col-span-6 lg:col-span-5" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-20 px-4 pt-20 pb-24 sm:px-6 lg:space-y-28 lg:px-8 lg:pt-28">
        <Suspense fallback={<NewsRailSkeleton />}>
          <NewsRail />
        </Suspense>
        <ActorsSection />
        <ValuesSection />
      </div>
    </>
  );
}
