import { CircleCheck, ClipboardList, MessageSquareText, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getCatalogo } from "@/lib/api";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import {
  FormAcreditacion,
  FormDatosNatural,
  FormDocumento,
  FormNombres,
  FormRepresentante,
} from "@/components/cuenta/perfil";
import { Progreso } from "@/components/cuenta/piezas";
import type { VistaPerfil } from "@/lib/auth/servicio";
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

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const u = await getPerfil();
  if (!u) redirect("/ingresar?volver=/mi-cuenta");
  const { guardado } = await searchParams;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-tinta/75">
            {u.tipo === "NATURAL" ? "Persona natural" : "Organización"} · {u.correo}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-fuerte">Hola, {u.corto}</h2>
        </div>
        {/* Insignia de la verificación: se verifica sola al cargar los documentos. */}
        {u.documentosCompletos && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-exito/10 px-3 py-1 text-sm font-semibold text-exito-oscuro ring-1 ring-exito/30 ring-inset">
            <ShieldCheck size={15} aria-hidden="true" />
            <span className="sr-only">Estado de verificación: </span>
            Verificado
          </span>
        )}
      </div>

      <Aviso guardado={guardado} />

      <div data-tour="progreso" className="mt-6 rounded-2xl bg-superficie p-5">
        <Progreso pasos={u.pasos} />
      </div>

      <Datos u={u} />

      <div className="mt-8 space-y-4">
        {u.tipo === "NATURAL" ? (
          <Paso numero={1} paso={u.pasos[0]!} resumen={telefono(u)}>
            <FormDatosNatural perfil={u.perfil} ocupaciones={await getCatalogo("ocupaciones")} />
          </Paso>
        ) : (
          <>
            <Paso
              numero={1}
              paso={u.pasos[0]!}
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
              resumen={
                u.perfil.acreditacion && `Documento de acreditación: ${u.perfil.acreditacion}`
              }
            >
              <FormAcreditacion perfil={u.perfil} />
            </Paso>
          </>
        )}
      </div>

      <Verificacion u={u} />

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/participa"
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-linea px-4 font-display font-bold text-fuerte transition-colors hover:border-rojo hover:text-enlace"
          >
            <MessageSquareText size={20} aria-hidden="true" className="text-enlace" />
            Participar
          </Link>
        </li>
        <li>
          <Link
            href="/mi-cuenta/participaciones"
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-linea px-4 font-display font-bold text-fuerte transition-colors hover:border-rojo hover:text-enlace"
          >
            <ClipboardList size={20} aria-hidden="true" className="text-enlace" />
            Mis participaciones
          </Link>
        </li>
      </ul>

      <p className="mt-8 text-sm text-tinta/80">
        La contraseña, el cierre de sesión y la baja de la cuenta están en{" "}
        <Link
          href="/mi-cuenta/seguridad"
          className="font-semibold text-enlace underline underline-offset-2"
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
  if (guardado === "completo" || guardado === "verificado") {
    const verificado = guardado === "verificado";
    return (
      <div
        role="status"
        className="mt-6 flex flex-col gap-4 rounded-2xl bg-exito/10 p-5 ring-1 ring-exito/30 ring-inset sm:flex-row sm:items-center"
      >
        <p className="flex flex-1 items-start gap-3 text-fuerte">
          <CircleCheck size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-exito-oscuro" />
          <span>
            <strong className="font-semibold">
              {verificado
                ? "Tu cuenta está verificada: ya puedes enviar propuestas formales."
                : "Tu perfil está completo: ya puedes participar."}
            </strong>
          </span>
        </p>
        <Link
          href={verificado ? "/participa?tipo=propuesta" : "/participa"}
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
      className="mt-6 flex items-center gap-3 rounded-2xl bg-exito/10 p-4 text-sm text-fuerte ring-1 ring-exito/30 ring-inset"
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
function Datos({ u }: { u: VistaPerfil }) {
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
          <dd className="font-semibold break-words text-fuerte">{v}</dd>
        </div>
      ))}
    </dl>
  );
  if (u.tipo !== "NATURAL") return <div className="mt-6">{lista}</div>;

  return (
    <details className="group mt-6 rounded-2xl border border-linea open:border-fuerte/20">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">{lista}</div>
        <span className="text-sm font-semibold text-enlace group-open:hidden">Editar</span>
      </summary>
      <div className="border-t border-linea p-4 sm:p-5">
        <FormNombres nombres={u.nombres} apellidos={u.apellidos} />
      </div>
    </details>
  );
}

/**
 * Verificación para propuestas formales (opcional, R18): los documentos según el tipo de cuenta.
 * Para opinar no hace falta.
 */
function Verificacion({ u }: { u: VistaPerfil }) {
  const que =
    u.tipo === "NATURAL"
      ? "cargar tu cédula"
      : u.perfil.acreditacion === "Sí"
        ? "cargar el documento de la organización y el que acredita tu representación"
        : "cargar el documento de la organización";
  return (
    <section
      id="verificacion"
      aria-labelledby="verificacion-titulo"
      className="mt-10 scroll-mt-24 border-t border-linea pt-8"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="verificacion-titulo" className="font-display text-xl font-extrabold text-fuerte">
          Verificación para propuestas formales
        </h3>
        <span className="rounded-full bg-superficie px-2.5 py-0.5 text-sm font-semibold text-tinta/80">
          Opcional
        </span>
      </div>
      <p className="mt-2 text-tinta/85">
        Si quieres hacer propuestas formales, necesitas una verificación extra: {que}. Para opinar
        no hace falta.
      </p>
      {u.documentosCompletos && !u.perfilCompleto && (
        <p className="mt-2 text-sm font-semibold text-fuerte">
          Tus documentos están cargados. Completa tu perfil para enviar propuestas formales.
        </p>
      )}
      <div className="mt-5 space-y-4">
        {u.tipo === "NATURAL" ? (
          <Paso numero={1} paso={u.pasosVerificacion[0]!} resumen={u.documentos.IDENTIDAD?.nombre}>
            <FormDocumento
              documento="IDENTIDAD"
              etiqueta="Foto o PDF de tu cédula"
              ayuda="Ambas caras si es posible, legible y vigente. PDF, JPG o PNG de hasta 2 MB."
              actual={u.documentos.IDENTIDAD}
            />
          </Paso>
        ) : (
          u.pasosVerificacion.map((paso, i) =>
            paso.clave === "ENTIDAD" ? (
              <Paso
                key={paso.clave}
                numero={i + 1}
                paso={paso}
                resumen={u.documentos.ENTIDAD?.nombre}
              >
                <FormDocumento
                  documento="ENTIDAD"
                  etiqueta="Acta constitutiva, registro del consejo comunal o carta aval"
                  ayuda="El documento que acredita la existencia de la organización. PDF, JPG o PNG de hasta 2 MB."
                  actual={u.documentos.ENTIDAD}
                />
              </Paso>
            ) : (
              <Paso
                key={paso.clave}
                numero={i + 1}
                paso={paso}
                resumen={u.documentos.REPRESENTACION?.nombre}
              >
                <FormDocumento
                  documento="REPRESENTACION"
                  etiqueta="Documento que acredita tu condición"
                  ayuda="Acta de asamblea, carta aval o poder. PDF, JPG o PNG de hasta 2 MB."
                  actual={u.documentos.REPRESENTACION}
                />
              </Paso>
            ),
          )
        )}
      </div>
    </section>
  );
}

/** Un paso del perfil. Pendiente: abierto. Hecho: plegado con su resumen y opción de editar. */
function Paso({
  numero,
  paso,
  resumen,
  children,
}: {
  numero: number;
  paso: { titulo: string; hecho: boolean };
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
        <span className="block font-display font-extrabold text-fuerte">{paso.titulo}</span>
        {paso.hecho && resumen && (
          <span className="block truncate text-sm text-tinta/80">{resumen}</span>
        )}
      </span>
    </span>
  );

  return (
    <details
      open={!paso.hecho}
      className="group rounded-2xl border border-linea open:border-fuerte/20"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        {cabecera}
        {paso.hecho && (
          <span className="text-sm font-semibold text-enlace group-open:hidden">Editar</span>
        )}
      </summary>
      <div className="border-t border-linea p-4 sm:p-5">{children}</div>
    </details>
  );
}
