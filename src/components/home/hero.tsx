import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ENCABEZADO_INICIAL, type EncabezadoInicio } from "@/lib/sitio";
import { CarruselProvider, CreditoCarrusel, FondoCarrusel } from "./hero-carrusel";

export type Foto = {
  src: string;
  /** Qué muestra la foto, para quien no la ve. */
  alt: string;
  /** Sin autor, la foto es de la Alcaldía. */
  autor?: string;
  licencia?: { nombre: string; url?: string };
  /** Página de la obra original (exigida por licencias CC BY y CC BY-SA). */
  fuente?: string;
  /** Encuadre (`object-position`) para que el motivo no quede tras el titular. */
  posicion?: string;
};

/**
 * Hero de la guía: fotos de la ciudad a sangre con velo oscuro, que se alternan con un fundido.
 * Sin fotos, usa el patrón urbano de la guía y el isotipo.
 */
export function Hero({
  fotos = [],
  textos = ENCABEZADO_INICIAL,
}: {
  fotos?: Foto[];
  /** Frase destacada, título y subtítulo (los edita la alcaldía, R17). */
  textos?: Pick<EncabezadoInicio, "destacado" | "titulo" | "subtitulo">;
}) {
  const foto = fotos[0];
  const contenido = (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-noche">
      <div className="absolute inset-0 -z-10">
        {foto ? (
          // En escritorio las fotos ocupan la mitad derecha para que el motivo no quede tras el titular.
          <FondoCarrusel />
        ) : (
          <div aria-hidden="true" className="hero-fondo patron-urbano absolute inset-0" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-noche/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgb(46_19_77)_0%,rgb(46_19_77)_36%,rgb(46_19_77/0.55)_52%,rgb(46_19_77/0.1)_100%)]"
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-36 sm:px-6 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:pt-20 lg:pb-48">
        <div className="cascada">
          <h1
            id="hero-titulo"
            // Tamaño calculado para que «Pensando en grande:» (unos 11 em) quepa en una línea.
            className="font-display text-[clamp(1.55rem,8vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-papel lg:text-[clamp(2.5rem,4.7vw,4rem)]"
          >
            {textos.destacado && (
              <>
                <span className="block whitespace-nowrap text-amarillo italic">
                  {textos.destacado}
                </span>{" "}
              </>
            )}
            {textos.titulo}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-papel/85">{textos.subtitulo}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/participa"
              className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-rojo px-7 font-display font-bold text-papel shadow-elevada transition-[background-color,transform] duration-150 ease-out-expo hover:bg-rojo-oscuro active:scale-[0.97]"
            >
              Participar
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/registro"
              className="inline-flex min-h-13 items-center justify-center rounded-xl bg-papel px-6 font-display font-bold text-noche transition-[background-color,transform] duration-150 ease-out-expo hover:bg-superficie active:scale-[0.97]"
            >
              Registro municipal de actores sociales
            </Link>
          </div>
          {foto && <CreditoCarrusel />}
        </div>

        {!foto && (
          <Image
            src="/brand/pdul-ya-isotipo.png"
            alt="Isotipo de PDUL YA"
            width={800}
            height={708}
            loading="eager"
            className="flotar mx-auto hidden w-full max-w-[19rem] drop-shadow-[0_24px_40px_rgb(0_0_0/0.35)] lg:block"
          />
        )}
      </div>
    </section>
  );
  return foto ? <CarruselProvider fotos={fotos}>{contenido}</CarruselProvider> : contenido;
}
