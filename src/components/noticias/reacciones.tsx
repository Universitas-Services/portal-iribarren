"use client";

import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { reaccionarAccion, vistaAccion } from "@/lib/noticias/acciones";
import type { Reaccion, ResumenInteracciones } from "@/lib/noticias/interacciones";

const numero = new Intl.NumberFormat("es-VE");

/** Lo que se ve al instante al pulsar, antes de la respuesta del servidor. */
function aplicar(r: ResumenInteracciones, reaccion: Reaccion): ResumenInteracciones {
  const quita = r.mia === reaccion;
  const resta = (tipo: Reaccion) => (r.mia === tipo ? 1 : 0);
  return {
    ...r,
    likes: r.likes - resta("LIKE") + (!quita && reaccion === "LIKE" ? 1 : 0),
    dislikes: r.dislikes - resta("DISLIKE") + (!quita && reaccion === "DISLIKE" ? 1 : 0),
    mia: quita ? null : reaccion,
  };
}

/**
 * Vistas y «Me gusta» / «No me gusta» de una noticia. La página es estática, así que la vista
 * se cuenta desde aquí al abrirla. Para reaccionar hace falta la sesión (no el perfil completo).
 */
export function ReaccionesNoticia({ slug }: { slug: string }) {
  const [resumen, setResumen] = useState<ResumenInteracciones | null>(null);
  const [pedirSesion, setPedirSesion] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const contada = useRef(false);

  useEffect(() => {
    // En desarrollo React monta dos veces: la vista se cuenta una sola.
    if (contada.current) return;
    contada.current = true;
    vistaAccion(slug).then((r) => r && setResumen(r));
  }, [slug]);

  const pulsar = (reaccion: Reaccion) => {
    if (!resumen) return;
    const anterior = resumen;
    setResumen(aplicar(resumen, reaccion));
    iniciar(async () => {
      const r = await reaccionarAccion(slug, reaccion);
      if (r.estado === "OK") setResumen(r.resumen);
      else {
        setResumen(anterior);
        if (r.estado === "SIN_SESION") setPedirSesion(true);
      }
    });
  };

  const boton =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-display text-sm font-bold ring-1 ring-linea transition-[background-color,color,transform] duration-150 active:scale-[0.96] disabled:opacity-60";

  return (
    <section
      aria-label="Reacciones a esta noticia"
      className="flex flex-wrap items-center justify-between gap-4 rounded-tarjeta bg-papel p-5 shadow-tarjeta sm:px-8"
    >
      <p className="flex items-center gap-2 text-sm text-tinta/75">
        <Eye size={18} aria-hidden="true" />
        {resumen ? (
          <span>
            <span className="font-semibold text-noche tabular-nums">
              {numero.format(resumen.vistas)}
            </span>{" "}
            {resumen.vistas === 1 ? "vista" : "vistas"}
          </span>
        ) : (
          <span className="skeleton inline-block h-4 w-16 rounded" aria-hidden="true" />
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => pulsar("LIKE")}
          disabled={!resumen || pendiente}
          aria-pressed={resumen?.mia === "LIKE"}
          className={`${boton} aria-pressed:bg-rojo aria-pressed:text-papel aria-pressed:ring-rojo ${
            resumen?.mia === "LIKE" ? "" : "bg-papel text-noche hover:bg-rojo/8 hover:text-rojo"
          }`}
        >
          <ThumbsUp size={18} aria-hidden="true" />
          Me gusta
          <span className="tabular-nums">{resumen ? numero.format(resumen.likes) : "—"}</span>
        </button>
        <button
          type="button"
          onClick={() => pulsar("DISLIKE")}
          disabled={!resumen || pendiente}
          aria-pressed={resumen?.mia === "DISLIKE"}
          className={`${boton} aria-pressed:bg-noche aria-pressed:text-papel aria-pressed:ring-noche ${
            resumen?.mia === "DISLIKE" ? "" : "bg-papel text-noche hover:bg-noche/8"
          }`}
        >
          <ThumbsDown size={18} aria-hidden="true" />
          No me gusta
          <span className="tabular-nums">{resumen ? numero.format(resumen.dislikes) : "—"}</span>
        </button>
      </div>

      {pedirSesion && (
        <p role="status" className="w-full rounded-2xl bg-superficie p-4 text-sm text-tinta">
          Para reaccionar necesitas tu cuenta.{" "}
          <Link
            href={`/ingresar?volver=${encodeURIComponent(`/noticias/${slug}`)}`}
            className="font-bold text-rojo underline"
          >
            Inicia sesión
          </Link>{" "}
          o{" "}
          <Link href="/registro" className="font-bold text-rojo underline">
            regístrate
          </Link>
          .
        </p>
      )}
    </section>
  );
}
