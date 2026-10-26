import {
  ArrowRight,
  FileText,
  Landmark,
  MessageSquareText,
  Newspaper,
  Quote,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { getHome } from "@/lib/api";
import { EnlaceCampana, SelloCampana } from "@/components/campana/banner-campana";
import { Tile } from "./tile";

/** Llamado principal a participar, en el rojo institucional. */
export function OpinionTile({ className = "" }: { className?: string }) {
  return (
    <Tile
      aria-labelledby="opinion-titulo"
      className={`relative flex flex-col overflow-hidden bg-rojo p-6 text-papel sm:p-8 ${className}`}
    >
      <MessageSquareText
        aria-hidden="true"
        strokeWidth={1.25}
        className="pointer-events-none absolute -right-6 -bottom-8 size-44 text-papel/10"
      />
      <h2 id="opinion-titulo" className="font-display text-2xl leading-tight font-extrabold">
        Tu opinión construye ciudad
      </h2>
      <p className="mt-3 leading-relaxed text-papel/90">
        Opina sobre una noticia, envía una idea o presenta una propuesta formal. Cada aporte recibe
        su folio, y las propuestas formales, además, una respuesta.
      </p>
      <Link
        href="/participa"
        className="group mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-papel px-5 font-display font-bold text-rojo transition-[transform,background-color] duration-150 ease-out-expo hover:bg-superficie active:scale-[0.97] sm:mt-auto sm:pt-0"
      >
        Participar
        <ArrowRight
          size={18}
          aria-hidden="true"
          className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1"
        />
      </Link>
    </Tile>
  );
}

const ACCESOS: { href: string; label: string; detalle: string; Icon: LucideIcon; tono: string }[] =
  [
    {
      href: "/noticias",
      label: "Noticias",
      detalle: "Avances y novedades",
      Icon: Newspaper,
      tono: "bg-rojo/10 text-rojo",
    },
    {
      href: "/conoce-el-pdul",
      label: "Información institucional",
      detalle: "Qué es el PDUL",
      Icon: Landmark,
      tono: "bg-naranja/15 text-rojo-oscuro",
    },
    {
      href: "/documentos",
      label: "Documentos de interés",
      detalle: "Decreto e informes",
      Icon: FileText,
      tono: "bg-amarillo/20 text-rojo-oscuro",
    },
    {
      href: "/participa",
      label: "Tu opinión cuenta",
      detalle: "Opina y propón",
      Icon: MessageSquareText,
      tono: "bg-noche/10 text-noche",
    },
  ];

/** Accesos rápidos de la guía: íconos en círculos tintados. */
export function AccessTile({ className = "" }: { className?: string }) {
  return (
    <Tile aria-labelledby="accesos-titulo" className={`bg-papel p-6 sm:p-8 ${className}`}>
      <h2 id="accesos-titulo" className="font-display text-2xl font-extrabold text-noche">
        Accede rápido
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {ACCESOS.map(({ href, label, detalle, Icon, tono }) => (
          <li key={href + label}>
            <Link
              href={href}
              className="group flex h-full flex-col gap-3 rounded-xl border border-linea p-4 transition-[transform,box-shadow,border-color] duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-transparent hover:shadow-tarjeta active:scale-[0.97]"
            >
              <span className={`grid size-11 place-items-center rounded-full ${tono}`}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display leading-tight font-bold text-noche group-hover:text-rojo">
                  {label}
                </span>
                <span className="mt-1 block text-sm text-tinta/75">{detalle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

/**
 * Mensaje del alcalde. Con API, es la noticia de texto que la alcaldía elige en el admin
 * (GET /portal/home); mientras no haya una elegida, muestra el texto provisional.
 */
export function MayorTile({
  className = "",
  mensaje,
}: {
  className?: string;
  mensaje?: { slug: string; titulo: string; resumen: string } | null;
}) {
  return (
    <Tile
      as="article"
      aria-labelledby="alcalde-titulo"
      className={`flex flex-col bg-noche p-6 text-papel sm:p-8 ${className}`}
    >
      <Quote aria-hidden="true" size={36} className="text-amarillo" />
      <h2 id="alcalde-titulo" className="sr-only">
        Mensaje del alcalde
      </h2>
      {mensaje ? (
        <>
          <p className="mt-4 font-display text-xl leading-snug font-bold sm:text-[1.4rem]">
            {mensaje.titulo}
          </p>
          <p className="mt-3 line-clamp-4 leading-relaxed text-papel/85">{mensaje.resumen}</p>
          <Link
            href={`/noticias/${mensaje.slug}`}
            className="mt-4 inline-flex min-h-11 items-center gap-2 self-start font-display font-bold text-amarillo hover:underline"
          >
            Leer el mensaje
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </>
      ) : (
        <p className="mt-4 font-display text-xl leading-snug font-bold sm:text-[1.4rem]">
          Dejamos atrás la ultractividad del plan de 2003. Con el Decreto 48-2026 abrimos una
          planificación moderna, participativa y con rigor científico, que saldrá de las oficinas
          para construirse en la calle, contigo.
        </p>
      )}
      <div className="mt-auto flex items-center gap-3 pt-6">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-full bg-rojo font-display font-extrabold"
        >
          YA
        </span>
        <p className="leading-tight">
          <span className="block font-display font-bold">Yanys Agüero</span>
          <span className="text-sm text-papel/75">
            Alcalde de Iribarren{mensaje ? "" : " · texto provisional"}
          </span>
        </p>
      </div>
    </Tile>
  );
}

/**
 * Acceso a la campaña «Barquisimeto suena en ti» de la Alcaldía, en el morado de la campaña.
 * Ocupa todo el ancho del tablero: texto a la izquierda y la ilustración a la derecha.
 */
export function CampanaTile({ className = "" }: { className?: string }) {
  return (
    <Tile
      aria-labelledby="campana-titulo"
      className={`relative isolate overflow-hidden bg-noche text-papel ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_100%_0%,rgb(249_115_22/0.35),transparent_60%),radial-gradient(60%_100%_at_80%_100%,rgb(230_57_86/0.3),transparent_65%)]"
      />
      <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_1.15fr] md:gap-10 lg:px-10">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.14em] text-amarillo uppercase">
            Campaña de la Alcaldía de Iribarren
          </p>
          <h2
            id="campana-titulo"
            className="mt-2 font-display text-2xl leading-tight font-extrabold text-crema sm:text-3xl"
          >
            Barquisimeto suena en ti
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-papel/85">
            Sus lugares, su música y su gente. Descubre la ciudad que suena en cada barquisimetano.
          </p>
          <EnlaceCampana className="mt-5" />
        </div>
        <SelloCampana className="mx-auto w-full max-w-md md:max-w-none" />
      </div>
    </Tile>
  );
}

/** El mensaje del alcalde leído del Inicio elegido por la alcaldía. */
export async function MensajeAlcaldeTile({ className = "" }: { className?: string }) {
  const { mensajeAlcalde } = await getHome();
  return <MayorTile className={className} mensaje={mensajeAlcalde} />;
}
