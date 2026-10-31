"use client";

import {
  ClipboardCheck,
  Copy,
  FileText,
  Loader2,
  Lock,
  MessageSquare,
  Newspaper,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { NOMBRE_TIPO_PARTICIPACION, type TipoParticipacion } from "@/lib/api/types";
import { enviarParticipacionAccion, type EstadoFormulario } from "@/lib/auth/acciones";
import {
  DESCRIPCION_MAX,
  DESCRIPCION_MIN,
  MAX_IMAGENES,
  participacionSchema,
  videoSchema,
} from "@/lib/validation/schemas";
import { Campo, ResumenErrores } from "./campos";
import { CampoArchivo, CampoImagenes, CampoSelect, Dialogo } from "./piezas";
import { SelectorUbicacion } from "./selector-ubicacion";
import { formatoCoordenadas } from "@/lib/ubicacion";
import { AUTOR_ANONIMO } from "@/lib/participacion";

const TIPOS: { valor: TipoParticipacion; titulo: string; texto: string; Icon: typeof FileText }[] =
  [
    {
      valor: "OPINION_GENERAL",
      titulo: NOMBRE_TIPO_PARTICIPACION.OPINION_GENERAL,
      texto: "Lo que piensas sobre el plan o sobre tu comunidad.",
      Icon: MessageSquare,
    },
    {
      valor: "OPINION_NOTICIA",
      titulo: NOMBRE_TIPO_PARTICIPACION.OPINION_NOTICIA,
      texto: "Comenta una noticia publicada en el portal.",
      Icon: Newspaper,
    },
    {
      valor: "PROPUESTA_FORMAL",
      titulo: NOMBRE_TIPO_PARTICIPACION.PROPUESTA_FORMAL,
      texto: "Una propuesta técnica con su documento de soporte.",
      Icon: FileText,
    },
  ];

const inicial: EstadoFormulario = {};

/** Lee el formulario como lo hará el servidor, para validar antes de abrir la confirmación. */
function leerFormulario(form: HTMLFormElement) {
  const fd = new FormData(form);
  const datos: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") datos[k] = v;
    else if (v.size > 0) datos[k] = v;
  }
  datos.imagenes = fd.getAll("imagenes").filter((f) => f instanceof File && f.size > 0);
  datos.mostrarNombre = fd.get("mostrarNombre") ?? undefined;
  return datos;
}

/** Formulario 3 de la v3: opinión general, opinión sobre noticia o propuesta formal. */
export function FormParticipacion({
  noticias,
  parroquias,
  categoriasTecnicas,
  tipoInicial,
  noticiaInicial,
  puedeProponer,
  faltantes,
  pidioPropuesta,
  idempotencia,
  autor,
}: {
  noticias: { slug: string; titulo: string }[];
  /** Los desplegables vigentes de la alcaldía. */
  parroquias: string[];
  categoriasTecnicas: string[];
  tipoInicial: TipoParticipacion;
  noticiaInicial?: string;
  /**
   * Perfil completo y documentos cargados: lo exige solo la propuesta formal. Sin eso, su opción
   * queda deshabilitada. Las opiniones no tienen requisito.
   */
  puedeProponer: boolean;
  /** Lo que falta para proponer: datos del perfil y documentos de la verificación. */
  faltantes: string[];
  /** Llegó pidiendo una propuesta formal sin poder enviarla: se explica qué falta. */
  pidioPropuesta?: boolean;
  idempotencia: string;
  autor: string;
}) {
  const [estado, accion] = useActionState(enviarParticipacionAccion, inicial);
  const form = useRef<HTMLFormElement>(null);
  const v = estado.valores ?? {};
  const [tipo, setTipo] = useState<TipoParticipacion>(() => {
    const t = (v.tipo as TipoParticipacion | undefined) ?? tipoInicial;
    return t === "PROPUESTA_FORMAL" && !puedeProponer ? "OPINION_GENERAL" : t;
  });
  const [descripcion, setDescripcion] = useState(v.descripcion ?? "");
  const [locales, setLocales] = useState<Record<string, string>>({});
  const [resumen, setResumen] = useState<Record<string, string> | null>(null);

  // Cada respuesta del servidor reemplaza los errores locales y cierra la confirmación.
  const [ultimo, setUltimo] = useState(estado);
  if (estado !== ultimo) {
    setUltimo(estado);
    setLocales({});
    setResumen(null);
  }

  const errores = { ...estado.errores, ...locales };
  // Memorizado: el resumen toma el foco cuando cambia este objeto, y uno nuevo en cada render
  // devolvía el foco arriba con cada tecla y no dejaba corregir el campo.
  const mostrado: EstadoFormulario = useMemo(
    () => (Object.keys(locales).length ? { errores: locales } : estado),
    [locales, estado],
  );
  const largo = descripcion.trim().length;

  function revisar() {
    if (!form.current) return;
    const datos = leerFormulario(form.current);
    const p = participacionSchema.safeParse(datos);
    if (!p.success) {
      const e: Record<string, string> = {};
      for (const i of p.error.issues) e[String(i.path[0])] ??= i.message;
      setLocales(e);
      return;
    }
    setLocales({});
    const d = p.data;
    setResumen({
      Tipo: NOMBRE_TIPO_PARTICIPACION[d.tipo],
      ...(d.noticia
        ? { Noticia: noticias.find((n) => n.slug === d.noticia)?.titulo ?? d.noticia }
        : {}),
      Parroquia: d.parroquia,
      Sector: d.sector,
      ...(d.latitud !== undefined && d.longitud !== undefined
        ? { Ubicación: formatoCoordenadas({ lat: d.latitud, lng: d.longitud }) }
        : {}),
      "Categoría técnica": d.categoriaTecnica,
      ...(d.soporte ? { Soporte: d.soporte.name } : {}),
      ...(d.imagenes.length
        ? { Fotos: d.imagenes.length === 1 ? "1 imagen" : `${d.imagenes.length} imágenes` }
        : {}),
      ...(d.video
        ? { Video: d.video.fuente === "YOUTUBE" ? "Enlace de YouTube" : "Enlace de Instagram" }
        : {}),
      "Nombre público": d.mostrarNombre ? `Sí, como «${autor}»` : `No, como «${AUTOR_ANONIMO}»`,
    });
  }

  return (
    <form ref={form} action={accion} noValidate className="space-y-6">
      <input type="hidden" name="idempotencia" value={idempotencia} />

      {pidioPropuesta && !puedeProponer && (
        <div className="flex items-start gap-3 rounded-2xl bg-amarillo/15 p-5 text-fuerte ring-1 ring-amarillo/60 ring-inset">
          <Lock size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Para enviar una propuesta formal, primero completa tu perfil y la verificación con
              documentos. Mientras tanto, puedes enviar una opinión.
            </p>
            {faltantes.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {faltantes.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            <Link
              href="/mi-cuenta#verificacion"
              className="mt-3 inline-block font-semibold text-enlace underline underline-offset-2"
            >
              Ir a Mi cuenta
            </Link>
          </div>
        </div>
      )}

      <ResumenErrores estado={mostrado} />

      <fieldset data-tour="tipo">
        <legend className="mb-2 font-display text-sm font-bold text-fuerte">
          ¿Qué quieres enviar?
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <label
              key={t.valor}
              className="flex cursor-pointer flex-col gap-2 rounded-2xl border-2 border-linea p-4 transition-colors hover:border-fuerte/30 has-[:checked]:border-rojo has-[:checked]:bg-rojo/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:border-linea has-[:disabled]:bg-superficie has-[:disabled]:opacity-70 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rojo has-[:focus-visible]:ring-offset-2"
            >
              <span className="flex items-center justify-between">
                <t.Icon size={22} aria-hidden="true" className="text-enlace" />
                <input
                  type="radio"
                  name="tipo"
                  value={t.valor}
                  aria-label={t.titulo}
                  aria-describedby={`tipo-${t.valor}`}
                  checked={tipo === t.valor}
                  disabled={t.valor === "PROPUESTA_FORMAL" && !puedeProponer}
                  onChange={() => setTipo(t.valor)}
                  className="size-4 accent-rojo"
                />
              </span>
              <span className="font-display font-extrabold text-fuerte">{t.titulo}</span>
              <span id={`tipo-${t.valor}`} className="text-sm leading-snug text-tinta/80">
                {t.texto}
                {t.valor === "PROPUESTA_FORMAL" && !puedeProponer && (
                  <span className="mt-1 flex items-start gap-1 font-semibold text-fuerte">
                    <Lock size={13} aria-hidden="true" className="mt-1 shrink-0" />
                    <span>
                      Requiere el perfil completo y la verificación con documentos en{" "}
                      <Link
                        href="/mi-cuenta#verificacion"
                        className="text-enlace underline underline-offset-2"
                      >
                        Mi cuenta
                      </Link>
                      .
                    </span>
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {tipo === "OPINION_NOTICIA" && (
        <CampoSelect
          id="noticia"
          etiqueta="¿Sobre qué noticia?"
          opciones={noticias.map((n) => ({ valor: n.slug, texto: n.titulo }))}
          vacio="Selecciona la noticia"
          defaultValue={v.noticia ?? noticiaInicial ?? ""}
          error={errores.noticia}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoSelect
          id="parroquia"
          etiqueta="Parroquia"
          opciones={parroquias}
          defaultValue={v.parroquia ?? ""}
          error={errores.parroquia}
        />
        <Campo
          id="sector"
          etiqueta="Comunidad, barrio o sector (referencia)"
          maxLength={150}
          placeholder="Por ejemplo, urb. Patarata, frente a la plaza"
          defaultValue={v.sector}
          error={errores.sector}
        />
      </div>

      <SelectorUbicacion
        inicial={
          v.latitud && v.longitud ? { lat: Number(v.latitud), lng: Number(v.longitud) } : undefined
        }
        obligatorio={tipo === "PROPUESTA_FORMAL"}
        error={errores.ubicacion}
      />

      <CampoSelect
        id="categoriaTecnica"
        etiqueta="¿Con qué área del plan se relaciona?"
        opciones={categoriasTecnicas}
        defaultValue={v.categoriaTecnica ?? ""}
        error={errores.categoriaTecnica}
      />

      <div>
        <label
          htmlFor="descripcion"
          className="mb-1.5 block font-display text-sm font-bold text-fuerte"
        >
          {tipo === "PROPUESTA_FORMAL" ? "Tu propuesta" : "Tu opinión"}
        </label>
        <p id="descripcion-ayuda" className="mb-2 text-sm text-tinta/75">
          Explica la situación que identificaste, sus motivos y, si corresponde, la solución que
          propones.
        </p>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={7}
          maxLength={DESCRIPCION_MAX}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          aria-invalid={errores.descripcion ? true : undefined}
          aria-describedby={`descripcion-ayuda descripcion-contador${errores.descripcion ? " descripcion-error" : ""}`}
          className={`w-full rounded-xl border bg-tarjeta px-4 py-3 leading-relaxed text-fuerte transition-colors outline-none focus-visible:border-rojo ${
            errores.descripcion ? "border-rojo" : "border-linea hover:border-fuerte/40"
          }`}
        />
        <p
          id="descripcion-contador"
          className={`mt-1 text-right text-sm tabular-nums ${
            largo > 0 && largo < DESCRIPCION_MIN ? "text-fuerte" : "text-tinta/70"
          }`}
        >
          {largo < DESCRIPCION_MIN
            ? `${largo} / ${DESCRIPCION_MAX} · mínimo ${DESCRIPCION_MIN}`
            : `${largo} / ${DESCRIPCION_MAX}`}
        </p>
        {errores.descripcion && (
          <p id="descripcion-error" className="text-sm text-enlace">
            {errores.descripcion}
          </p>
        )}
      </div>

      <CampoImagenes
        id="imagenes"
        etiqueta="Fotos"
        ayuda={`Del lugar o de la situación. Hasta ${MAX_IMAGENES} JPG, PNG o WebP de 2 MB cada una.`}
        max={MAX_IMAGENES}
        error={errores.imagenes}
      />

      <Campo
        id="video"
        etiqueta="Enlace de un video (opcional)"
        type="url"
        inputMode="url"
        placeholder="https://youtu.be/… o https://www.instagram.com/reel/…"
        defaultValue={v.video}
        esquema={videoSchema.optional()}
        ayuda="Sube el video a YouTube o Instagram y pega aquí el enlace de la publicación."
        error={errores.video}
      />

      <CampoArchivo
        id="soporte"
        etiqueta={tipo === "PROPUESTA_FORMAL" ? "Documento de soporte" : "Documento de apoyo"}
        ayuda="Planos, estudios, actas o cartas. PDF, JPG o PNG de hasta 2 MB."
        requerido={tipo === "PROPUESTA_FORMAL"}
        error={errores.soporte}
      />

      <fieldset
        data-tour="nombre-publico"
        className="rounded-2xl bg-superficie p-4"
        aria-describedby={
          errores.mostrarNombre
            ? "mostrar-nombre-ayuda mostrarNombre-error"
            : "mostrar-nombre-ayuda"
        }
      >
        <legend className="float-left mb-1 font-display font-bold text-fuerte">
          Si la alcaldía publica tu aporte, ¿quieres que aparezca tu nombre?
        </legend>
        <p id="mostrar-nombre-ayuda" className="clear-left leading-relaxed text-tinta">
          La alcaldía puede publicar cualquier aporte en el portal; tú decides si se ve tu nombre.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {[
            { valor: "si", texto: `Sí, como «${autor}»` },
            { valor: "no", texto: `No, como «${AUTOR_ANONIMO}»` },
          ].map((o, i) => (
            <label
              key={o.valor}
              className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-linea bg-tarjeta px-4 font-semibold text-fuerte has-[:checked]:border-rojo has-[:checked]:bg-rojo/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rojo"
            >
              <input
                type="radio"
                id={i === 0 ? "mostrarNombre" : undefined}
                name="mostrarNombre"
                value={o.valor}
                defaultChecked={v.mostrarNombre === o.valor}
                className="size-4 shrink-0 accent-rojo"
              />
              {o.texto}
            </label>
          ))}
        </div>
        {errores.mostrarNombre && (
          <p id="mostrarNombre-error" className="mt-1.5 text-sm text-enlace">
            {errores.mostrarNombre}
          </p>
        )}
      </fieldset>

      <div data-tour="enviar">
        <button
          type="button"
          onClick={revisar}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-plata disabled:active:scale-100"
        >
          <ClipboardCheck size={18} aria-hidden="true" />
          Revisar y enviar
        </button>
      </div>

      <Dialogo
        abierto={resumen !== null}
        onCerrar={() => setResumen(null)}
        titulo="Confirma tu envío"
      >
        <dl className="mt-4 space-y-2 rounded-2xl bg-superficie p-4 text-sm">
          {Object.entries(resumen ?? {}).map(([k, val]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-32 shrink-0 text-tinta/75">{k}</dt>
              <dd className="min-w-0 font-semibold break-words text-fuerte">{val}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-start gap-2 font-semibold text-fuerte">
          <Lock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-enlace" />
          Una vez enviada no podrás editarla ni eliminarla.
        </p>
        <AccionesConfirmar onVolver={() => setResumen(null)} />
      </Dialogo>
    </form>
  );
}

function AccionesConfirmar({ onVolver }: { onVolver: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel hover:bg-rojo-oscuro disabled:cursor-wait disabled:opacity-80"
      >
        {pending && <Loader2 size={18} aria-hidden="true" className="animate-spin" />}
        {pending ? "Enviando de forma segura…" : "Confirmar envío"}
      </button>
      <button
        type="button"
        onClick={onVolver}
        disabled={pending}
        className="min-h-12 flex-1 rounded-xl border-2 border-linea px-5 font-display font-bold text-fuerte hover:border-fuerte/40 disabled:opacity-50"
      >
        Volver a editar
      </button>
      <span role="status" className="sr-only">
        {pending ? "Enviando tu aporte" : ""}
      </span>
    </div>
  );
}

/** Copiar el folio al portapapeles, con confirmación visible y anunciada. */
export function CopiarFolio({ folio }: { folio: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(folio);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2500);
        } catch {
          setCopiado(false);
        }
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-tarjeta px-4 font-semibold text-fuerte ring-1 ring-linea hover:ring-fuerte/40 print:hidden"
    >
      <Copy size={16} aria-hidden="true" />
      <span aria-live="polite">{copiado ? "Copiado" : "Copiar folio"}</span>
    </button>
  );
}

export function Imprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-linea px-5 font-display font-bold text-fuerte hover:border-fuerte/40 print:hidden"
    >
      <Printer size={18} aria-hidden="true" />
      Imprimir comprobante
    </button>
  );
}
