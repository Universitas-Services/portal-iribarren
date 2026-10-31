import { Check, Eye, FileText, ImageIcon, ThumbsUp } from "lucide-react";
import Link from "next/link";
import {
  NOMBRE_TIPO_PARTICIPACION,
  type EstadoParticipacion,
  type TipoParticipacion,
} from "@/lib/api/types";
import type { Imagen } from "@/lib/api/types";
import type { ArchivoAporte } from "@/lib/auth/servicio";
import type { EnlaceVideo } from "@/lib/noticias/video";
import { formatearFechaHora, formatearPeso } from "@/lib/formato";
import { ESTADO_PARTICIPACION, RECIBIDA, tieneSeguimiento, urlAdjunto } from "@/lib/participacion";
import { VisorDocumento } from "@/components/noticias/contenido-noticia";
import { Galeria } from "@/components/noticias/galeria";
import { ReproductorVideo } from "@/components/noticias/reproductor-video";

/*
 * Piezas para mostrar un aporte: en el acuse, en «Mis participaciones» y en la galería pública.
 * Son componentes de servidor; ninguno ofrece editar ni eliminar (el aporte es inmutable).
 */

export type AporteVisible = {
  folio: string;
  tipo: TipoParticipacion;
  noticia?: { slug: string; titulo: string };
  parroquia: string;
  sector: string;
  categoriaTecnica: string;
  descripcion: string;
  imagenes: ArchivoAporte[];
  video?: EnlaceVideo;
  /** Solo en la vista del autor: la página pública no lo trae (R19). */
  soporte?: ArchivoAporte;
};

/** Estado de un aporte. Sin `tipo` (línea de tiempo) muestra el estado tal cual. */
export function InsigniaEstado({
  estado,
  tipo,
}: {
  estado: EstadoParticipacion;
  tipo?: TipoParticipacion;
}) {
  const e =
    tipo && !tieneSeguimiento(tipo) && estado !== "PUBLICADA"
      ? RECIBIDA
      : ESTADO_PARTICIPACION[estado];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-xs font-bold ring-1 ring-inset ${e.clase}`}
    >
      <span className="sr-only">Estado: </span>
      {e.texto}
    </span>
  );
}

/**
 * Ficha del aporte: datos, texto y adjuntos. `extra` agrega filas (autor, fecha, estado…).
 * `base` es la página del aporte: sus adjuntos se abren por `base/archivo/[id]` (R19).
 */
export function FichaAporte({
  aporte,
  base,
  extra = [],
  titulo = "Comprobante",
  pie,
}: {
  aporte: AporteVisible;
  base: string;
  extra?: [string, string][];
  titulo?: string;
  pie?: string;
}) {
  const p = aporte;
  const filas: [string, string][] = [
    ["Tipo", NOMBRE_TIPO_PARTICIPACION[p.tipo]],
    ...(p.noticia ? ([["Noticia", p.noticia.titulo]] as [string, string][]) : []),
    ["Parroquia", p.parroquia],
    ["Sector", p.sector],
    ["Categoría técnica", p.categoriaTecnica],
    ...extra,
  ];
  return (
    <section aria-labelledby="ficha-aporte" className="rounded-2xl bg-superficie p-5">
      <h2 id="ficha-aporte" className="font-display font-extrabold text-fuerte">
        {titulo}
      </h2>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {filas.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-tinta/75">{k}</dt>
            <dd className="font-semibold [overflow-wrap:anywhere] text-fuerte">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-linea pt-4">
        <p className="text-sm text-tinta/75">
          {p.tipo === "PROPUESTA_FORMAL" ? "Propuesta" : "Opinión"}
        </p>
        <p className="mt-1 leading-relaxed whitespace-pre-line text-fuerte">{p.descripcion}</p>
      </div>
      <Adjuntos aporte={p} base={base} />
      {pie && <p className="mt-4 text-sm text-tinta/80">{pie}</p>}
    </section>
  );
}

/**
 * Fotos, video y documento de soporte del aporte, como en las noticias (R19). Lo que no se puede
 * abrir (con la API de antes de R19, sin id) se lista por su nombre, como siempre.
 */
function Adjuntos({ aporte: p, base }: { aporte: AporteVisible; base: string }) {
  const fotos = p.imagenes.flatMap((a, i): Imagen[] => {
    const src = urlAdjunto(a, base);
    return src
      ? [
          {
            src,
            alt: `Foto ${i + 1} del aporte ${p.folio}`,
            ancho: 1600,
            alto: 1200,
            credito: a.credito,
            // Los ejemplos de la simulación usan fotos libres de la ciudad, no las del aporte.
            ilustrativa: !!a.credito,
          },
        ]
      : [];
  });
  const sinVer = p.imagenes.filter((a) => !urlAdjunto(a, base));
  const soporte = p.soporte && urlAdjunto(p.soporte, base);
  // Las fotos que pasan por la ruta del portal no van al optimizador: su URL firmada vence.
  const sinOptimizar = p.imagenes.some((a) => !a.url);

  if (!fotos.length && !sinVer.length && !p.soporte && !p.video) return null;
  return (
    <div className="mt-4 space-y-5 border-t border-linea pt-4">
      {fotos.length > 0 && (
        <Galeria imagenes={fotos} titulo={`aporte ${p.folio}`} sinOptimizar={sinOptimizar} />
      )}
      {p.video && <ReproductorVideo video={p.video} titulo={`Video del aporte ${p.folio}`} />}
      {p.soporte && soporte && p.soporte.mime === "application/pdf" && (
        <VisorDocumento
          titulo="Documento de soporte"
          adjunto={{
            nombre: p.soporte.nombre,
            url: soporte,
            tipo: "application/pdf",
            pesoBytes: p.soporte.tamano,
          }}
          bajarUrl={p.soporte.url ? undefined : urlAdjunto(p.soporte, base, true)}
        />
      )}
      {p.soporte && soporte && p.soporte.mime !== "application/pdf" && (
        <div>
          <p className="mb-2 text-sm text-tinta/75">Documento de soporte</p>
          <Galeria
            imagenes={[
              {
                src: soporte,
                alt: `Documento de soporte del aporte ${p.folio}`,
                ancho: 1600,
                alto: 1200,
              },
            ]}
            titulo={`documento de soporte del aporte ${p.folio}`}
            sinOptimizar={!p.soporte.url}
          />
        </div>
      )}
      {((p.soporte && !soporte) || sinVer.length > 0) && (
        <ul className="space-y-2 text-sm text-tinta">
          {p.soporte && !soporte && (
            <li className="flex items-start gap-2">
              <FileText size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-enlace" />
              <span>
                Soporte: <span className="font-semibold text-fuerte">{p.soporte.nombre}</span> (
                {formatearPeso(p.soporte.tamano)})
              </span>
            </li>
          )}
          {sinVer.length > 0 && (
            <li className="flex items-start gap-2">
              <ImageIcon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-enlace" />
              <span>
                {sinVer.length === 1 ? "1 foto" : `${sinVer.length} fotos`}:{" "}
                <span className="font-semibold break-words text-fuerte">
                  {sinVer.map((i) => i.nombre).join(", ")}
                </span>
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/** Línea de tiempo de estados, del más antiguo al actual, con el comentario del revisor. */
export function LineaTiempoEstados({
  historial,
}: {
  historial: { estado: EstadoParticipacion; fecha: string; comentario?: string }[];
}) {
  return (
    <ol className="relative">
      {historial.map((h, i) => {
        const actual = i === historial.length - 1;
        const rechazo = h.estado === "RECHAZADA";
        return (
          <li key={`${h.estado}-${h.fecha}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!actual && (
              <span
                aria-hidden="true"
                className="absolute top-9 bottom-0 left-[1.1rem] w-0.5 bg-rojo/30"
              />
            )}
            <span
              aria-hidden="true"
              className={`relative grid size-9 shrink-0 place-items-center rounded-full ${
                actual
                  ? rechazo
                    ? "bg-rojo text-papel"
                    : "border-4 border-rojo bg-tarjeta text-enlace"
                  : "bg-rojo text-papel"
              }`}
            >
              {actual ? <span className="size-2 rounded-full bg-current" /> : <Check size={16} />}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex flex-wrap items-center gap-2">
                <InsigniaEstado estado={h.estado} />
                <time dateTime={h.fecha} className="text-sm text-tinta/75">
                  {formatearFechaHora(h.fecha)}
                </time>
                {actual && <span className="sr-only">(estado actual)</span>}
              </p>
              {h.comentario && (
                <blockquote
                  className={`mt-2 rounded-2xl p-4 text-sm leading-relaxed ${
                    rechazo
                      ? "bg-rojo/8 text-fuerte ring-1 ring-rojo/30 ring-inset"
                      : "bg-superficie text-tinta"
                  }`}
                >
                  <span className="mb-1 block font-display text-xs font-bold tracking-wide text-tinta/70 uppercase">
                    {rechazo ? "Motivo del revisor" : "Comentario del revisor"}
                  </span>
                  {h.comentario}
                </blockquote>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Tarjeta de un aporte en un listado: todo el bloque es el enlace al detalle. */
export function TarjetaAporte({
  href,
  folio,
  tipo,
  parroquia,
  categoriaTecnica,
  descripcion,
  fecha,
  estado,
  autor,
  metricas,
}: {
  href: string;
  folio: string;
  tipo: TipoParticipacion;
  parroquia: string;
  categoriaTecnica: string;
  descripcion: string;
  fecha: string;
  estado?: EstadoParticipacion;
  autor?: string;
  /** Vistas y «Me gusta», en la galería pública y en el inicio. */
  metricas?: { vistas: number; likes: number };
}) {
  return (
    <article className="group relative flex h-full flex-col rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta transition-shadow duration-200 hover:shadow-elevada sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm font-extrabold text-fuerte tabular-nums">
          {folio}
        </span>
        {estado && <InsigniaEstado estado={estado} tipo={tipo} />}
      </div>
      <h3 className="mt-3 font-display text-lg leading-snug font-extrabold text-fuerte">
        <Link
          href={href}
          className="outline-none group-hover:text-enlace after:absolute after:inset-0 after:rounded-tarjeta focus-visible:after:ring-2 focus-visible:after:ring-rojo"
        >
          {NOMBRE_TIPO_PARTICIPACION[tipo]} · {parroquia}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-tinta/75">{categoriaTecnica}</p>
      <p className="mt-3 line-clamp-3 leading-relaxed text-tinta">{descripcion}</p>
      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 text-sm text-tinta/75">
        {autor && <span className="font-semibold text-fuerte">{autor}</span>}
        <time dateTime={fecha}>{formatearFechaHora(fecha)}</time>
        {metricas && (
          <>
            <span className="inline-flex items-center gap-1">
              <Eye size={15} aria-hidden="true" />
              <span className="tabular-nums">{metricas.vistas}</span>
              <span className="sr-only">vistas</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp size={15} aria-hidden="true" />
              <span className="tabular-nums">{metricas.likes}</span>
              <span className="sr-only">me gusta</span>
            </span>
          </>
        )}
      </p>
    </article>
  );
}
