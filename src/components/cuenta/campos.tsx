"use client";

import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Info, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ZodType } from "zod";
import type { EstadoFormulario } from "@/lib/auth/acciones";
import { cedulaSchema, DIGITOS_CEDULA, rifSchema } from "@/lib/validation/common";

/*
 * Piezas de formulario de las pantallas de cuenta. Cada error queda asociado a su campo con
 * aria-describedby y, al enviar, un resumen con enlaces recibe el foco.
 */

export const claseCampo = (error?: string, ancho = "w-full") =>
  `h-12 ${ancho} rounded-xl border bg-papel px-4 text-noche outline-none transition-colors placeholder:text-tinta/45 focus-visible:border-rojo ${
    error ? "border-rojo" : "border-linea hover:border-noche/40"
  }`;

const claseEtiqueta = "mb-1.5 block font-display text-sm font-bold text-noche";

function ErrorCampo({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-rojo">
      <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      {error}
    </p>
  );
}

/** Primer mensaje de error de un esquema Zod, o undefined si el valor es válido. */
function validarCon(esquema: ZodType, valor: string) {
  const r = esquema.safeParse(valor);
  return r.success ? undefined : r.error.issues[0]?.message;
}

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  /** Mismo esquema que usa el servidor: valida al salir del campo y mientras se corrige. */
  esquema?: ZodType;
  /** Quita en vivo los caracteres no admitidos y avisa con `avisoFiltro`. */
  filtrar?: (valor: string) => string;
  avisoFiltro?: string;
};

export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  esquema,
  filtrar,
  avisoFiltro,
  className = "",
  ...input
}: CampoProps) {
  // Al editar, el error del servidor deja paso a la validación local.
  const [local, setLocal] = useState<{ tocado: boolean; error?: string }>({ tocado: false });
  const [filtrado, setFiltrado] = useState(false);
  const mostrado = local.tocado ? local.error : error;
  const aviso = filtrado && !mostrado ? avisoFiltro : undefined;
  const describe = [mostrado && `${id}-error`, (ayuda || aviso) && `${id}-ayuda`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className={claseEtiqueta}>
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={mostrado ? true : undefined}
        aria-describedby={describe || undefined}
        className={claseCampo(mostrado)}
        {...input}
        onChange={(e) => {
          if (filtrar) {
            const limpio = filtrar(e.target.value);
            setFiltrado(limpio !== e.target.value);
            if (limpio !== e.target.value) e.target.value = limpio;
          }
          if (esquema && local.tocado)
            setLocal({ tocado: true, error: validarCon(esquema, e.target.value) });
          else if (!local.tocado && error) setLocal({ tocado: true });
        }}
        onBlur={(e) => {
          if (esquema && e.target.value.trim())
            setLocal({ tocado: true, error: validarCon(esquema, e.target.value) });
        }}
      />
      {(aviso || (ayuda && !mostrado)) && (
        <p
          id={`${id}-ayuda`}
          aria-live="polite"
          className={`mt-1.5 text-sm ${aviso ? "font-semibold text-noche" : "text-tinta/70"}`}
        >
          {aviso ?? ayuda}
        </p>
      )}
      <ErrorCampo id={id} error={mostrado} />
    </div>
  );
}

/** Deja solo letras (con tildes, ñ y ü) y espacios: para nombres y apellidos. */
export const soloLetras = (v: string) => v.replace(/[^\p{L} ]/gu, "");

const DOCUMENTOS = {
  cedula: {
    esquema: cedulaSchema,
    // Solo dígitos; el tope depende del prefijo (V hasta 8, E hasta 9).
    max: (prefijo: string) => DIGITOS_CEDULA[prefijo as keyof typeof DIGITOS_CEDULA]?.max ?? 9,
    formatear: (digitos: string) => digitos,
    completo: () => false,
  },
  rif: {
    esquema: rifSchema,
    // 8 dígitos y el verificador; el guion se pone solo.
    max: () => 9,
    formatear: (d: string) => (d.length > 8 ? `${d.slice(0, 8)}-${d.slice(8)}` : d),
    completo: (digitos: string) => digitos.length === 9,
  },
};

/**
 * Documento con prefijo: cédula (V/E) o RIF (J/G/C). El número admite solo dígitos (si se pega
 * "V-12.345.678" se toma la letra como prefijo y se quitan puntos y guiones), y se valida con
 * el mismo esquema del servidor, que luego une prefijo y número.
 */
export function CampoDocumento({
  id,
  etiqueta,
  prefijos,
  error,
  valorPrefijo,
  valorNumero,
  placeholder,
  ayuda,
}: {
  id: "cedula" | "rif";
  etiqueta: string;
  prefijos: readonly string[];
  error?: string;
  valorPrefijo?: string;
  valorNumero?: string;
  placeholder: string;
  ayuda: string;
}) {
  const doc = DOCUMENTOS[id];
  const [prefijo, setPrefijo] = useState(valorPrefijo ?? prefijos[0]!);
  const [digitos, setDigitos] = useState((valorNumero ?? "").replace(/\D/g, ""));
  const [local, setLocal] = useState<{ tocado: boolean; error?: string }>({ tocado: false });

  const validar = (p: string, d: string) =>
    setLocal({ tocado: true, error: validarCon(doc.esquema, `${p}-${doc.formatear(d)}`) });

  /** Toma lo escrito o pegado: si empieza por un prefijo válido lo usa y deja solo los dígitos. */
  const aplicar = (entrada: string) => {
    let texto = entrada.trim().toUpperCase();
    let p = prefijo;
    if (prefijos.includes(texto[0] ?? "")) {
      p = texto[0]!;
      texto = texto.slice(1);
      setPrefijo(p);
    }
    const d = texto.replace(/\D/g, "").slice(0, doc.max(p));
    setDigitos(d);
    if (local.tocado || doc.completo(d)) validar(p, d);
  };

  const mostrado = local.tocado ? local.error : error;
  const valido = local.tocado && !local.error && doc.completo(digitos);
  const max = doc.max(prefijo);

  return (
    <fieldset aria-describedby={mostrado ? `${id}-error` : `${id}-ayuda`}>
      <legend className={claseEtiqueta}>{etiqueta}</legend>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`${id}Prefijo`}>
          Prefijo
        </label>
        <select
          id={`${id}Prefijo`}
          name={`${id}Prefijo`}
          value={prefijo}
          onChange={(e) => {
            setPrefijo(e.target.value);
            if (local.tocado && digitos) validar(e.target.value, digitos);
          }}
          className={`${claseCampo(mostrado, "w-20")} shrink-0 px-3 font-display font-bold`}
        >
          {prefijos.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${id}Numero`}>
          Número
        </label>
        <input
          id={`${id}Numero`}
          name={`${id}Numero`}
          inputMode="numeric"
          autoComplete="off"
          required
          placeholder={placeholder}
          value={doc.formatear(digitos)}
          // Tope nativo: limita también antes de que cargue el JavaScript (el RIF suma el guion).
          maxLength={id === "rif" ? max + 1 : max}
          onChange={(e) => aplicar(e.target.value)}
          onPaste={(e) => {
            // Lo pegado ("V-12.345.678") se limpia antes de que maxLength lo recorte.
            e.preventDefault();
            aplicar(e.clipboardData.getData("text"));
          }}
          onBlur={() => {
            if (digitos) validar(prefijo, digitos);
          }}
          aria-invalid={mostrado ? true : undefined}
          className={`${claseCampo(mostrado)} min-w-0 tabular-nums`}
        />
      </div>
      {!mostrado && (
        <p
          id={`${id}-ayuda`}
          aria-live="polite"
          className={`mt-1.5 flex items-start gap-1.5 text-sm ${
            valido ? "font-semibold text-exito-oscuro" : "text-tinta/70"
          }`}
        >
          {valido && <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />}
          {valido ? "RIF válido: el dígito verificador coincide." : ayuda}
        </p>
      )}
      <ErrorCampo id={id} error={mostrado} />
    </fieldset>
  );
}

const REGLAS = [
  { texto: "10 caracteres o más", ok: (v: string) => v.length >= 10 },
  { texto: "Una mayúscula", ok: (v: string) => /[A-Z]/.test(v) },
  { texto: "Una minúscula", ok: (v: string) => /[a-z]/.test(v) },
  { texto: "Un número", ok: (v: string) => /\d/.test(v) },
  { texto: "Un símbolo", ok: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

/** Contraseña con botón para mostrarla y, al crearla, las reglas que se van cumpliendo. */
export function CampoContrasena({
  id,
  etiqueta,
  error,
  nueva = false,
  autoComplete,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  nueva?: boolean;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  const [valor, setValor] = useState("");
  const cumplidas = REGLAS.filter((r) => r.ok(valor)).length;

  return (
    <div>
      <label htmlFor={id} className={claseEtiqueta}>
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error && `${id}-error`, nueva && `${id}-reglas`].filter(Boolean).join(" ") || undefined
          }
          className={`${claseCampo(error)} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-tinta/70 hover:text-noche"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          <span className="sr-only">{visible ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
        </button>
      </div>
      {nueva && (
        <div id={`${id}-reglas`} className="mt-2.5">
          <div aria-hidden="true" className="flex gap-1">
            {REGLAS.map((r, i) => (
              <span
                key={r.texto}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                  i < cumplidas
                    ? cumplidas === REGLAS.length
                      ? "bg-exito"
                      : cumplidas >= 3
                        ? "bg-amarillo"
                        : "bg-rojo"
                    : "bg-linea"
                }`}
              />
            ))}
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
            {REGLAS.map((r) => {
              const ok = r.ok(valor);
              return (
                <li
                  key={r.texto}
                  className={`flex items-center gap-1.5 ${ok ? "text-exito-oscuro" : "text-tinta/70"}`}
                >
                  {ok ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
                  {r.texto}
                  <span className="sr-only">{ok ? "(cumplido)" : "(pendiente)"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <ErrorCampo id={id} error={error} />
    </div>
  );
}

export function Casilla({
  id,
  error,
  children,
}: {
  id: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-tinta">
        <input
          id={id}
          name={id}
          type="checkbox"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-rojo"
        />
        <span className="leading-relaxed">{children}</span>
      </label>
      <ErrorCampo id={id} error={error} />
    </div>
  );
}

const ETIQUETAS: Record<string, string> = {
  cedula: "Cédula",
  nombres: "Nombres",
  apellidos: "Apellidos",
  correo: "Correo",
  contrasena: "Contraseña",
  confirmarContrasena: "Confirmación de la contraseña",
  aceptaTerminos: "Términos de uso",
  aceptaPoliticaDatos: "Política de datos",
  tipoEntidad: "Tipo de entidad",
  razonSocial: "Razón social",
  rif: "RIF",
};

/** Resumen de errores: recibe el foco al aparecer y enlaza a cada campo. */
export function ResumenErrores({ estado }: { estado: EstadoFormulario }) {
  const caja = useRef<HTMLDivElement>(null);
  const errores = Object.entries(estado.errores ?? {});
  useEffect(() => {
    if (errores.length || estado.mensaje?.tipo === "error") caja.current?.focus();
  }, [estado, errores.length]);

  if (!errores.length && !estado.mensaje) return null;
  const m = estado.mensaje;
  const estilo =
    errores.length || m?.tipo === "error"
      ? { caja: "bg-rojo/8 text-noche ring-rojo/30", Icon: AlertCircle, icono: "text-rojo" }
      : m?.tipo === "exito"
        ? {
            caja: "bg-exito/10 text-noche ring-exito/30",
            Icon: CheckCircle2,
            icono: "text-exito-oscuro",
          }
        : { caja: "bg-superficie text-noche ring-linea", Icon: Info, icono: "text-tinta/70" };

  return (
    <div
      ref={caja}
      tabIndex={-1}
      role={errores.length || m?.tipo === "error" ? "alert" : "status"}
      className={`mb-6 flex gap-3 rounded-2xl p-4 ring-1 outline-none ring-inset ${estilo.caja}`}
    >
      <estilo.Icon size={20} aria-hidden="true" className={`mt-0.5 shrink-0 ${estilo.icono}`} />
      <div className="text-sm leading-relaxed">
        {errores.length > 0 ? (
          <>
            <p className="font-semibold">
              Revisa {errores.length === 1 ? "este dato" : "estos datos"}:
            </p>
            <ul className="mt-1 list-disc pl-5">
              {errores.map(([campo, texto]) => (
                <li key={campo}>
                  <a
                    href={`#${campo === "cedula" ? "cedulaNumero" : campo === "rif" ? "rifNumero" : campo}`}
                    className="underline"
                  >
                    {ETIQUETAS[campo] ?? campo}
                  </a>
                  : {texto}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>{m?.texto}</p>
        )}
      </div>
    </div>
  );
}

export function BotonEnviar({ children, enviando }: { children: ReactNode; enviando: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
    >
      {pending && <Loader2 size={18} aria-hidden="true" className="animate-spin" />}
      {pending ? enviando : children}
    </button>
  );
}

/** Solo en desarrollo: el enlace que en producción llegaría por correo. */
export function AvisoDesarrollo({ enlace }: { enlace?: string }) {
  if (!enlace) return null;
  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-amarillo bg-amarillo/10 p-4 text-sm text-noche">
      <p className="font-display font-bold">Solo en desarrollo</p>
      <p className="mt-1">
        En producción este enlace llega por correo.{" "}
        <a href={enlace} className="font-semibold text-rojo underline">
          Abrir el enlace
        </a>
      </p>
    </div>
  );
}
