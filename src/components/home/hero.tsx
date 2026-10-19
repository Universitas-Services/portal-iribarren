import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type Foto = {
  src: string;
  /** Qué muestra la foto, para quien no la ve. */
  alt: string;
  autor: string;
  licencia: { nombre: string; url: string };
  /** Página de la obra original (exigida por licencias CC BY y CC BY-SA). */
  fuente: string;
};

/**
 * Hero de la guía: foto de la ciudad a sangre con velo oscuro.
 * Sin foto, usa el patrón urbano de la guía y el isotipo.
 */
export function Hero({ foto }: { foto?: Foto }) {
  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-noche">
      <div className="absolute inset-0 -z-10">
        {foto ? (
          // En escritorio la foto ocupa la mitad derecha para que el motivo no quede tras el titular.
          <div className="absolute inset-0 lg:left-[36%]">
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              preload
              sizes="(min-width: 1024px) 64vw, 100vw"
              className="hero-fondo object-cover object-[50%_35%]"
            />
          </div>
        ) : (
          <div aria-hidden="true" className="hero-fondo patron-urbano absolute inset-0" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-noche/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgb(35_42_54)_0%,rgb(35_42_54)_36%,rgb(35_42_54/0.55)_52%,rgb(35_42_54/0.1)_100%)]"
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-36 sm:px-6 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:pt-20 lg:pb-48">
        <div className="cascada">
          <h1
            id="hero-titulo"
            className="font-display text-[clamp(2.1rem,5.2vw,4.25rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-papel"
          >
            <span className="text-amarillo">PDUL YA:</span> Construyendo el Barquisimeto del futuro,
            humano y sostenible
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-papel/85">
            Planificación urbana participativa para la ciudad humana. Infórmate, opina y propón: el
            plan se construye con tu voz.
          </p>
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
              Registro municipal de actores
            </Link>
          </div>
          {foto && (
            <p className="mt-6 text-xs text-papel/70">
              Foto:{" "}
              <a href={foto.fuente} rel="noopener noreferrer" target="_blank" className="underline">
                {foto.autor}
              </a>{" "}
              ·{" "}
              <a
                href={foto.licencia.url}
                rel="noopener noreferrer license"
                target="_blank"
                className="underline"
              >
                {foto.licencia.nombre}
              </a>
            </p>
          )}
        </div>

        {!foto && (
          <Image
            src="/brand/pdul-ya-isotipo.png"
            alt="Isotipo de PDUL YA"
            width={512}
            height={588}
            loading="eager"
            className="flotar mx-auto hidden w-full max-w-[19rem] drop-shadow-[0_24px_40px_rgb(0_0_0/0.35)] lg:block"
          />
        )}
      </div>
    </section>
  );
}
