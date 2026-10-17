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
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CATEGORIAS_TECNICAS,
  NOMBRE_TIPO_PARTICIPACION,
  PARROQUIAS,
  type TipoParticipacion,
} from "@/lib/api/types";
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
  datos.mostrarNombre = fd.get("mostrarNombre") === "on";
  return datos;
}

/** Formulario 3 de la v3: opinión general, opinión sobre noticia o propuesta formal. */
export function FormParticipacion({
  noticias,
  tipoInicial,
  noticiaInicial,
  puedeEnviar,
  faltantes,
  idempotencia,
  autor,
}: {
  noticias: { slug: string; titulo: string }[];
  tipoInicial: TipoParticipacion;
  noticiaInicial?: string;
  puedeEnviar: boolean;
  faltantes: string[];
  idempotencia: string;
  autor: string;
}) {
  const [estado, accion] = useActionState(enviarParticipacionAccion, inicial);
  const form = useRef<HTMLFormElement>(null);
  const v = estado.valores ?? {};
  const [tipo, setTipo] = useState<TipoParticipacion>(
    (v.tipo as TipoParticipacion | undefined) ?? tipoInicial,
  );
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
  const mostrado: EstadoFormulario = Object.keys(locales).length ? { errores: locales } : estado;
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
      "Categoría técnica": d.categoriaTecnica,
      ...(d.soporte ? { Soporte: d.soporte.name } : {}),
      ...(d.imagenes.length
        ? { Fotos: d.imagenes.length === 1 ? "1 imagen" : `${d.imagenes.length} imágenes` }
        : {}),
      ...(d.video
        ? { Video: d.video.fuente === "YOUTUBE" ? "Enlace de YouTube" : "Enlace de Instagram" }
        : {}),
      "Nombre público": d.mostrarNombre ? `Sí, como «${autor}»` : "No",
    });
  }

  return (
    <form ref={form} action={accion} noValidate className="space-y-6">
      <input type="hidden" name="idempotencia" value={idempotencia} />

      {!puedeEnviar && (
        <div className="flex items-start gap-3 rounded-2xl bg-amarillo/15 p-5 text-noche ring-1 ring-amarillo/60 ring-inset">
          <Lock size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Para enviar, primero completa tu perfil.</p>
            {faltantes.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {faltantes.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            <Link
              href="/mi-cuenta"
              className="mt-3 inline-block font-semibold text-rojo underline underline-offset-2"
            >
              Completar mi perfil
            </Link>
          </div>
        </div>
      )}

      <ResumenErrores estado={mostrado} />

      <fieldset>
        <legend className="mb-2 font-display text-sm font-bold text-noche">
          ¿Qué quieres enviar?
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <label
              key={t.valor}
              className="flex cursor-pointer flex-col gap-2 rounded-2xl border-2 border-linea p-4 transition-colors hover:border-noche/30 has-[:checked]:border-rojo has-[:checked]:bg-rojo/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rojo has-[:focus-visible]:ring-offset-2"
            >
              <span className="flex items-center justify-between">
                <t.Icon size={22} aria-hidden="true" className="text-rojo" />
                <input
                  type="radio"
                  name="tipo"
                  value={t.valor}
                  aria-label={t.titulo}
                  aria-describedby={`tipo-${t.valor}`}
                  checked={tipo === t.valor}
                  onChange={() => setTipo(t.valor)}
                  className="size-4 accent-rojo"
                />
              </span>
              <span className="font-display font-extrabold text-noche">{t.titulo}</span>
              <span id={`tipo-${t.valor}`} className="text-sm leading-snug text-tinta/80">
                {t.texto}
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
          opciones={PARROQUIAS}
          defaultValue={v.parroquia ?? ""}
          error={errores.parroquia}
        />
        <Campo
          id="sector"
          etiqueta="Comunidad, barrio o sector"
          maxLength={150}
          placeholder="Por ejemplo, urb. Patarata"
          defaultValue={v.sector}
          error={errores.sector}
        />
      </div>

      <CampoSelect
        id="categoriaTecnica"
        etiqueta="¿Con qué área del plan se relaciona?"
        opciones={CATEGORIAS_TECNICAS}
        defaultValue={v.categoriaTecnica ?? ""}
        error={errores.categoriaTecnica}
      />

      <div>
        <label
          htmlFor="descripcion"
          className="mb-1.5 block font-display text-sm font-bold text-noche"
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
          className={`w-full rounded-xl border bg-papel px-4 py-3 leading-relaxed text-noche transition-colors outline-none focus-visible:border-rojo ${
            errores.descripcion ? "border-rojo" : "border-linea hover:border-noche/40"
          }`}
        />
        <p
          id="descripcion-contador"
          className={`mt-1 text-right text-sm tabular-nums ${
            largo > 0 && largo < DESCRIPCION_MIN ? "text-noche" : "text-tinta/70"
          }`}
        >
          {largo < DESCRIPCION_MIN
            ? `${largo} / ${DESCRIPCION_MAX} · mínimo ${DESCRIPCION_MIN}`
            : `${largo} / ${DESCRIPCION_MAX}`}
        </p>
        {errores.descripcion && (
          <p id="descripcion-error" className="text-sm text-rojo">
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

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-superficie p-4">
        <input
          type="checkbox"
          name="mostrarNombre"
          defaultChecked={v.mostrarNombre === "true"}
          className="mt-0.5 size-5 shrink-0 accent-rojo"
        />
        <span className="leading-relaxed text-tinta">
          <span className="font-semibold text-noche">Mostrar mi nombre si se publica.</span> Si tu
          aporte es seleccionado para el portal público, aparecerá como «{autor}». Si no lo
          autorizas, se evalúa igual, pero no se publica.
        </span>
      </label>

      <div>
        <button
          type="button"
          onClick={revisar}
          disabled={!puedeEnviar}
          aria-describedby={!puedeEnviar ? "envio-bloqueado" : undefined}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-plata disabled:active:scale-100"
        >
          <ClipboardCheck size={18} aria-hidden="true" />
          Revisar y enviar
        </button>
        {!puedeEnviar && (
          <p id="envio-bloqueado" className="mt-2 text-center text-sm text-tinta/80">
            El envío se habilita cuando completes tu perfil.
          </p>
        )}
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
              <dd className="min-w-0 font-semibold break-words text-noche">{val}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-start gap-2 font-semibold text-noche">
          <Lock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
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
        className="min-h-12 flex-1 rounded-xl border-2 border-linea px-5 font-display font-bold text-noche hover:border-noche/40 disabled:opacity-50"
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
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-papel px-4 font-semibold text-noche ring-1 ring-linea hover:ring-noche/40 print:hidden"
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
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-linea px-5 font-display font-bold text-noche hover:border-noche/40 print:hidden"
    >
      <Printer size={18} aria-hidden="true" />
      Imprimir comprobante
    </button>
  );
}
