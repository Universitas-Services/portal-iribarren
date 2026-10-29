import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { CAMPANA } from "@/lib/campana";

/** Enlace a la campaña, en otra pestaña. */
export function EnlaceCampana({ className = "" }: { className?: string }) {
  return (
    <a
      href={CAMPANA.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amarillo px-5 font-display font-bold text-noche transition-[background-color,transform] duration-150 ease-out-expo hover:bg-naranja active:scale-[0.97] ${className}`}
    >
      Conoce la campaña
      <ArrowUpRight
        size={18}
        aria-hidden="true"
        className="transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}

/** Ilustración de Barquisimeto con la cinta «SUENA EN TI» debajo, como en la campaña. */
export function SelloCampana({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-end ${className}`}>
      <Image
        src={CAMPANA.ilustracion}
        alt={CAMPANA.nombre}
        width={2395}
        height={886}
        className="h-auto w-full"
      />
      <Image
        src={CAMPANA.cinta}
        // La cinta repite el nombre de la campaña, ya descrito en la ilustración.
        alt=""
        aria-hidden="true"
        width={1593}
        height={241}
        className="-mt-[3%] h-auto w-[66%]"
      />
    </div>
  );
}

/**
 * Publicidad institucional de la campaña dentro del contenido (Noticias, Documentos, Propuestas,
 * Conoce el PDUL y el detalle de una noticia). La etiqueta deja claro que es un anuncio.
 */
export function BannerCampana({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label={`Campaña ${CAMPANA.nombre}`}
      className={`relative isolate overflow-hidden rounded-tarjeta bg-noche text-papel shadow-tarjeta ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_100%_0%,rgb(249_115_22/0.35),transparent_60%),radial-gradient(60%_100%_at_85%_100%,rgb(230_57_86/0.35),transparent_65%)]"
      />
      <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr] md:gap-10">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.14em] text-amarillo uppercase">
            Campaña de la Alcaldía de Iribarren
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight font-extrabold text-crema sm:text-3xl">
            Barquisimeto suena en ti
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-papel/85">
            Sus lugares, su música y su gente. Descubre la ciudad que suena en cada barquisimetano.
          </p>
          <EnlaceCampana className="mt-5" />
        </div>
        <SelloCampana className="mx-auto w-full max-w-md md:max-w-none" />
      </div>
    </aside>
  );
}
