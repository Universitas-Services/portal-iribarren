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
import { AccessTile, CampanaTile, MayorTile, OpinionTile } from "@/components/home/static-tiles";
import { ThermometerTile } from "@/components/home/thermometer-tile";
import { ValuesSection } from "@/components/home/values-section";

const CC = (version: string) => ({
  nombre: `CC BY-SA ${version}`,
  url: `https://creativecommons.org/licenses/by-sa/${version}/deed.es`,
});

/**
 * Lugares emblemáticos de Barquisimeto que se alternan en el hero, empezando por Plaza Ayacucho.
 * Fotos libres de Wikimedia Commons con su crédito; se reemplazan por fotos oficiales de la
 * Alcaldía cuando lleguen (faltan Monumento al Sol, Plaza Miranda y Edificio Nacional).
 */
const FOTOS_HERO: Foto[] = [
  {
    src: "/fotos/plaza-ayacucho.jpg",
    alt: "Plaza Ayacucho de Barquisimeto, con la estatua ecuestre al fondo de la avenida arbolada",
    autor: "Rodolfo pimentel, Wikimedia Commons",
    licencia: CC("4.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Ayacucho1.jpg",
    posicion: "50% 55%",
  },
  {
    src: "/fotos/catedral-metropolitana.jpg",
    alt: "Catedral Metropolitana de Barquisimeto, con su torre blanca y techo de cristal",
    autor: "Rube96pinto, Wikimedia Commons",
    licencia: CC("4.0"),
    fuente:
      "https://commons.wikimedia.org/wiki/File:Santa_Iglesia_Catedral_Metropolitana,_Catedral_de_Barquisimeto.jpg",
  },
  {
    src: "/fotos/obelisco.jpg",
    alt: "El Obelisco de Barquisimeto visto de frente bajo el cielo azul",
    autor: "Miguel Ahiezer Salcedo, Wikimedia Commons",
    licencia: CC("3.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Obelisco_de_barquisimeto_vista_frontal.jpg",
    posicion: "50% 40%",
  },
  {
    src: "/fotos/iglesia-el-cristo.jpg",
    alt: "Interior de la Basílica del Santo Cristo de la Gracia, con sus bóvedas y vitrales de colores",
    autor: "Male3285, Wikimedia Commons",
    licencia: CC("3.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Iglesia_el_Cristo.jpg",
    posicion: "50% 45%",
  },
  {
    // Recorte del lado izquierdo de la original, para que el monumento quede a la derecha,
    // fuera del titular (la licencia pide indicar el cambio: «recorte»).
    src: "/fotos/manto-divina-pastora-hero.jpg",
    alt: "Silueta del Monumento Mariano Manto de la Divina Pastora contra un atardecer naranja",
    autor: "José Ocanto, Wikimedia Commons (recorte)",
    licencia: CC("4.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Monumento_Manto_1.jpg",
    posicion: "50% 100%",
  },
  {
    src: "/fotos/flor-de-venezuela.jpg",
    alt: "La Flor de Venezuela, estructura de pétalos metálicos en Barquisimeto",
    autor: "Miguel Ahiezer Salcedo, Wikimedia Commons",
    licencia: CC("3.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Flor_de_Venezuela_(Barquisimeto).jpg",
    posicion: "50% 50%",
  },
  {
    // Invertida en espejo para que las gradas queden a la derecha, fuera del titular (la licencia
    // pide indicar el cambio: «invertida»).
    src: "/fotos/estadio-gradas.jpg",
    alt: "Gradas techadas del Estadio Antonio Herrera Gutiérrez con público, bajo un cielo azul con nubes",
    autor: "Rodolfo pimentel, Wikimedia Commons (invertida)",
    licencia: CC("4.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:LAS_GRADAS.jpg",
    posicion: "100% 45%",
  },
  {
    src: "/fotos/parque-cardenalito.jpg",
    alt: "La tinaja del Parque El Cardenalito iluminada al anochecer, con la luna creciente",
    autor: "Angel Pérez Santamaria, Wikimedia Commons",
    licencia: {
      nombre: "CC0 1.0",
      url: "https://creativecommons.org/publicdomain/zero/1.0/deed.es",
    },
    fuente: "https://commons.wikimedia.org/wiki/File:Parque_Cardenalito.jpg",
    posicion: "70% 60%",
  },
  {
    src: "/fotos/iglesia-santa-rosa.jpg",
    alt: "Fachada de la Iglesia de Santa Rosa en Barquisimeto",
    autor: "Jesús David Ríos (Flickr), Wikimedia Commons",
    licencia: CC("2.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Iglesia_de_Santa_Rosa_1.jpg",
    posicion: "50% 40%",
  },
  {
    src: "/fotos/teatro-juares.jpg",
    alt: "Fachada del Teatro Juares en el centro de Barquisimeto",
    autor: "Wilfredor, Wikimedia Commons",
    licencia: CC("3.0"),
    fuente: "https://commons.wikimedia.org/wiki/File:Teatro_Juares.jpg",
    posicion: "50% 50%",
  },
];

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
      <Hero fotos={FOTOS_HERO} />

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
          <CampanaTile className="md:col-span-6 lg:col-span-12" />
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
