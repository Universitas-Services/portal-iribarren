"use client";

import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Video } from "@/lib/api/types";
import { duracionLegible, formatearDuracion } from "@/lib/formato";
import { idYoutube, urlEmbedYoutube } from "@/lib/noticias/video";
import { Instagram } from "@/components/icons";
import { CreditoImagen } from "./credito-imagen";

/**
 * Formato VIDEO. Un archivo subido se reproduce con el <video> nativo (controles, subtítulos
 * y pantalla completa del navegador). Un video de YouTube se muestra primero como portada y
 * solo se carga el reproductor, sin cookies, cuando la persona pulsa reproducir. Un video de
 * Instagram se abre en Instagram: el portal no carga sus scripts.
 */
/** Portada del video; sin imagen, usa el patrón urbano de la marca. */
function Portada({ video }: { video: Video }) {
  return video.portada ? (
    <>
      <Image
        src={video.portada.src}
        alt={video.portada.alt}
        fill
        sizes="(min-width: 896px) 864px, 100vw"
        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-noche/35" />
    </>
  ) : (
    <span aria-hidden="true" className="patron-urbano absolute inset-0" />
  );
}

export function ReproductorVideo({ video, titulo }: { video: Video; titulo: string }) {
  const [activo, setActivo] = useState(false);
  const id = video.fuente === "YOUTUBE" ? idYoutube(video.url) : undefined;

  const marco = "relative aspect-video w-full overflow-hidden bg-noche";

  let reproductor;
  if (video.fuente === "ARCHIVO") {
    reproductor = (
      <video
        controls
        playsInline
        preload="metadata"
        poster={video.portada?.src}
        className={`${marco} object-contain`}
        aria-label={`Video: ${titulo}`}
      >
        <source src={video.url} type={video.url.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        {video.subtitulos && (
          <track kind="captions" src={video.subtitulos} srcLang="es" label="Español" default />
        )}
        <p className="p-6 text-papel">
          Tu navegador no puede reproducir este video.{" "}
          <a href={video.url} className="underline" download>
            Descárgalo aquí
          </a>
          .
        </p>
      </video>
    );
  } else if (id && activo) {
    reproductor = (
      <div className={marco}>
        <iframe
          src={urlEmbedYoutube(id)}
          title={`Video: ${titulo}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full"
        />
      </div>
    );
  } else if (id) {
    reproductor = (
      <button
        type="button"
        onClick={() => setActivo(true)}
        className={`group ${marco} block text-left`}
      >
        <Portada video={video} />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-rojo text-papel shadow-elevada ring-8 ring-papel/20 transition-transform duration-300 ease-out-expo group-hover:scale-110"
        >
          <Play size={34} className="translate-x-0.5" fill="currentColor" />
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-noche/70 px-4 py-2 text-xs text-papel/85">
          Al reproducir se cargará YouTube.
        </span>
        <span className="sr-only">Reproducir el video «{titulo}»</span>
      </button>
    );
  } else {
    // Instagram (o un enlace de YouTube no reconocido): se abre en otra pestaña.
    const esInstagram = video.fuente === "INSTAGRAM";
    reproductor = (
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${marco} block`}
      >
        <Portada video={video} />
        <span className="absolute inset-0 grid place-items-center">
          <span className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-tarjeta px-5 font-display font-bold text-fuerte shadow-elevada transition-transform duration-200 ease-out-expo group-hover:scale-105">
            {esInstagram ? (
              <Instagram size={20} className="text-enlace" />
            ) : (
              <ExternalLink size={18} aria-hidden="true" />
            )}
            {esInstagram ? "Ver el video en Instagram" : "Ver el video"}
            <span className="sr-only">(se abre en otra pestaña)</span>
          </span>
        </span>
      </a>
    );
  }

  return (
    <figure className="overflow-hidden rounded-tarjeta bg-tarjeta shadow-elevada">
      {reproductor}
      <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm text-tinta/75">
        <span>
          {video.duracionSeg ? (
            <>
              Duración: <span aria-hidden="true">{formatearDuracion(video.duracionSeg)}</span>
              <span className="sr-only">{duracionLegible(video.duracionSeg)}</span>
            </>
          ) : (
            "Video"
          )}
          {video.subtitulos && " · Con subtítulos"}
        </span>
        <CreditoImagen credito={video.portada?.credito} />
      </figcaption>
    </figure>
  );
}
