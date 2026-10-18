import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock,
  MessageSquareText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import {
  FormAcreditacion,
  FormDatosNatural,
  FormDocumento,
  FormNombres,
  FormRepresentante,
} from "@/components/cuenta/perfil";
import { Progreso } from "@/components/cuenta/piezas";
import type { EstadoVerificacion } from "@/lib/api/types";
import type { PasoPerfil, VistaPerfil } from "@/lib/auth/servicio";
import { getPerfil } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function MiCuentaPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Mi cuenta" }]}
      titulo="Mi cuenta"
      ancho="max-w-2xl"
      pestana="perfil"
    >
      <Suspense fallback={<FormularioSkeleton campos={3} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

const VERIFICACION: Record<
  EstadoVerificacion,
  { texto: string; clase: string; Icon: typeof ShieldCheck }
> = {
  PENDIENTE: { texto: "En revisión", clase: "bg-superficie text-noche ring-linea", Icon: Clock },
  VERIFICADO: {
    texto: "Verificado",
    clase: "bg-exito/10 text-exito-oscuro ring-exito/30",
    Icon: ShieldCheck,
  },
  RECHAZADO: { texto: "Rechazado", clase: "bg-rojo/8 text-rojo ring-rojo/30", Icon: CircleAlert },
  REQUIERE_CORRECCION: {
    texto: "Requiere corrección",
    clase: "bg-amarillo/20 text-noche ring-amarillo/60",
    Icon: TriangleAlert,
  },
};

const NOMBRE_DOCUMENTO = {
  IDENTIDAD: "documento de identidad",
  REPRESENTACION: "documento que acredita la representación",
  ENTIDAD: "documento de la organización",
};

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const u = await getPerfil();
  if (!u) redirect("/ingresar?volver=/mi-cuenta");
  const { guardado } = await searchParams;
  const verif = VERIFICACION[u.estadoVerificacion];
  const enCorreccion = u.estadoVerificacion === "REQUIERE_CORRECCION" && !!u.correccion;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-tinta/75">
            {u.tipo === "NATURAL" ? "Persona natural" : "Organización"} · {u.correo}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-noche">Hola, {u.corto}</h2>
        </div>
        {u.perfilCompleto && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${verif.clase}`}
          >
            <verif.Icon size={15} aria-hidden="true" />
            <span className="sr-only">Estado de verificación: </span>
            {verif.texto}
          </span>
        )}
      </div>

      <Aviso guardado={guardado} />

      {enCorreccion && u.correccion && (
        <section
          aria-labelledby="correccion"
          className="mt-6 rounded-2xl bg-amarillo/15 p-5 ring-1 ring-amarillo/60 ring-inset"
        >
          <h3
            id="correccion"
            className="flex items-center gap-2 font-display font-extrabold text-noche"
          >
            <TriangleAlert size={20} aria-hidden="true" />
            Hay que corregir tu {NOMBRE_DOCUMENTO[u.correccion.documento]}
          </h3>
          <p className="mt-2 text-sm text-tinta">Mensaje del equipo revisor:</p>
          <blockquote className="mt-1 border-l-4 border-amarillo pl-3 leading-relaxed text-noche">
            {u.correccion.motivo}
          </blockquote>
          <p className="mt-3 text-sm text-tinta">
            Sube el archivo corregido más abajo. Tus demás datos ya revisados se mantienen.
          </p>
        </section>
      )}

      {u.estadoVerificacion === "RECHAZADO" && (
        <p className="mt-6 flex items-start gap-3 rounded-2xl bg-rojo/8 p-4 text-sm text-noche ring-1 ring-rojo/30 ring-inset">
          <CircleAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
          El equipo revisor no pudo validar tu identidad, así que por ahora no puedes enviar
          aportes. Escribe a soporte si crees que es un error.
        </p>
      )}

      <div className="mt-6 rounded-2xl bg-superficie p-5">
        <Progreso pasos={u.pasos} />
      </div>

      <Datos u={u} bloqueado={enCorreccion} />

      <div className="mt-8 space-y-4">
        {u.tipo === "NATURAL" ? (
          <>
            <Paso numero={1} paso={u.pasos[0]!} bloqueado={enCorreccion} resumen={telefono(u)}>
              <FormDatosNatural perfil={u.perfil} />
            </Paso>
            <Paso
              numero={2}
              paso={u.pasos[1]!}
              bloqueado={enCorreccion && u.correccion?.documento !== "IDENTIDAD"}
              abierto={u.correccion?.documento === "IDENTIDAD"}
              resumen={u.documentos.IDENTIDAD?.nombre}
            >
              <FormDocumento
                documento="IDENTIDAD"
                etiqueta="Foto o PDF de tu cédula"
                ayuda="Ambas caras si es posible, legible y vigente. PDF, JPG o PNG de hasta 2 MB."
                actual={u.documentos.IDENTIDAD}
              />
            </Paso>
          </>
        ) : (
          <>
            <Paso
              numero={1}
              paso={u.pasos[0]!}
              bloqueado={enCorreccion}
              resumen={
                u.perfil.nombresRepresentante &&
                `${u.perfil.nombresRepresentante} ${u.perfil.apellidosRepresentante ?? ""} · ${u.perfil.cedulaRepresentante ?? ""}`
              }
            >
              <FormRepresentante perfil={u.perfil} />
            </Paso>
            <Paso
              numero={2}
              paso={u.pasos[1]!}
              bloqueado={enCorreccion && u.correccion?.documento !== "REPRESENTACION"}
              abierto={u.correccion?.documento === "REPRESENTACION"}
              resumen={
                u.perfil.acreditacion && `Documento de acreditación: ${u.perfil.acreditacion}`
              }
            >
              <FormAcreditacion perfil={u.perfil} actual={u.documentos.REPRESENTACION} />
            </Paso>
            <Paso
              numero={3}
              paso={u.pasos[2]!}
              bloqueado={enCorreccion && u.correccion?.documento !== "ENTIDAD"}
              abierto={u.correccion?.documento === "ENTIDAD"}
              resumen={u.documentos.ENTIDAD?.nombre}
            >
              <FormDocumento
                documento="ENTIDAD"
                etiqueta="Acta constitutiva, registro del consejo comunal o carta aval"
                ayuda="El documento que acredita la existencia de la organización. PDF, JPG o PNG de hasta 2 MB."
                actual={u.documentos.ENTIDAD}
              />
            </Paso>
          </>
        )}
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/participa"
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-linea px-4 font-display font-bold text-noche transition-colors hover:border-rojo hover:text-rojo"
          >
            <MessageSquareText size={20} aria-hidden="true" className="text-rojo" />
            Participar
          </Link>
        </li>
        <li>
          <Link
            href="/mi-cuenta/participaciones"
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-linea px-4 font-display font-bold text-noche transition-colors hover:border-rojo hover:text-rojo"
          >
            <ClipboardList size={20} aria-hidden="true" className="text-rojo" />
            Mis participaciones
          </Link>
        </li>
      </ul>

      <p className="mt-8 text-sm text-tinta/80">
        La contraseña, el cierre de sesión y la baja de la cuenta están en{" "}
        <Link
          href="/mi-cuenta/seguridad"
          className="font-semibold text-rojo underline underline-offset-2"
        >
          Seguridad
        </Link>
        .
      </p>
    </div>
  );
}

const telefono = (u: VistaPerfil) =>
  u.perfil.telefono &&
  `${u.perfil.telefono.replace(/^(\d{4})(\d+)$/, "$1-$2")}${u.perfil.ocupacion ? ` · ${u.perfil.ocupacion}` : ""}`;

/** Aviso tras guardar (llega en la URL desde la acción). */
function Aviso({ guardado }: { guardado: unknown }) {
  if (guardado === "completo") {
    return (
      <div
        role="status"
        className="mt-6 flex flex-col gap-4 rounded-2xl bg-exito/10 p-5 ring-1 ring-exito/30 ring-inset sm:flex-row sm:items-center"
      >
        <p className="flex flex-1 items-start gap-3 text-noche">
          <CircleCheck size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-exito-oscuro" />
          <span>
            <strong className="font-semibold">
              Tu perfil está completo, ya puedes participar.
            </strong>{" "}
            El equipo revisor verificará tus documentos.
          </span>
        </p>
        <Link
          href="/participa"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          <MessageSquareText size={18} aria-hidden="true" />
          Participa
        </Link>
      </div>
    );
  }
  const texto = guardado === "1" ? "Cambios guardados." : null;
  if (!texto) return null;
  return (
    <p
      role="status"
      className="mt-6 flex items-center gap-3 rounded-2xl bg-exito/10 p-4 text-sm text-noche ring-1 ring-exito/30 ring-inset"
    >
      <CircleCheck size={20} aria-hidden="true" className="shrink-0 text-exito-oscuro" />
      {texto}
    </p>
  );
}

/**
 * Datos del registro. La persona natural puede corregir nombres y apellidos; la cédula, el RIF
 * y la razón social cambian con una solicitud a soporte.
 */
function Datos({ u, bloqueado }: { u: VistaPerfil; bloqueado: boolean }) {
  const filas: [string, string | undefined][] =
    u.tipo === "NATURAL"
      ? [
          ["Nombres", u.nombres],
          ["Apellidos", u.apellidos],
          ["Cédula", u.cedula],
        ]
      : [
          ["Razón social", u.razonSocial],
          ["RIF", u.rif],
          ["Tipo de entidad", u.tipoEntidad],
        ];
  const lista = (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
      {filas.map(([k, v]) => (
        <div key={k}>
          <dt className="text-sm text-tinta/75">{k}</dt>
          <dd className="font-semibold break-words text-noche">{v}</dd>
        </div>
      ))}
    </dl>
  );
  if (u.tipo !== "NATURAL" || bloqueado) return <div className="mt-6">{lista}</div>;

  return (
    <details className="group mt-6 rounded-2xl border border-linea open:border-noche/20">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">{lista}</div>
        <span className="text-sm font-semibold text-rojo group-open:hidden">Editar</span>
      </summary>
      <div className="border-t border-linea p-4 sm:p-5">
        <FormNombres nombres={u.nombres} apellidos={u.apellidos} />
      </div>
    </details>
  );
}

/**
 * Un paso del perfil. Pendiente: abierto. Hecho: plegado con su resumen y opción de editar.
 * En corrección, los pasos ya revisados quedan de solo lectura.
 */
function Paso({
  numero,
  paso,
  bloqueado,
  abierto,
  resumen,
  children,
}: {
  numero: number;
  paso: PasoPerfil;
  bloqueado: boolean;
  abierto?: boolean;
  resumen?: string;
  children: ReactNode;
}) {
  const cabecera = (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full font-display font-bold ${
          paso.hecho ? "bg-exito/15 text-exito-oscuro" : "bg-rojo text-papel"
        }`}
      >
        {paso.hecho ? <CircleCheck size={18} aria-hidden="true" /> : numero}
      </span>
      <span className="min-w-0">
        <span className="block font-display font-extrabold text-noche">{paso.titulo}</span>
        {paso.hecho && resumen && (
          <span className="block truncate text-sm text-tinta/80">{resumen}</span>
        )}
      </span>
    </span>
  );

  if (bloqueado) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-linea p-4">
        {cabecera}
        <span className="text-sm text-tinta/70">Revisado</span>
      </section>
    );
  }

  return (
    <details
      open={abierto || !paso.hecho}
      className="group rounded-2xl border border-linea open:border-noche/20"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        {cabecera}
        {paso.hecho && (
          <span className="text-sm font-semibold text-rojo group-open:hidden">Editar</span>
        )}
      </summary>
      <div className="border-t border-linea p-4 sm:p-5">{children}</div>
    </details>
  );
}
