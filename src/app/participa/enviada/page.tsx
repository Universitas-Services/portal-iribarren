import { CircleCheck, FileText, ImageIcon, Mail, MessageSquareText, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { CopiarFolio, Imprimir } from "@/components/cuenta/participacion";
import { NOMBRE_TIPO_PARTICIPACION } from "@/lib/api/types";
import { getParticipacion, getUsuario } from "@/lib/auth/sesion";
import { formatearFechaHora, formatearPeso } from "@/lib/formato";

export const metadata: Metadata = { title: "Aporte recibido", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Acuse de recibo (v3, pantalla de confirmación): folio inalterable, sin editar ni eliminar. */
export default function EnviadaPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[
        { href: "/", label: "Inicio" },
        { href: "/participa", label: "Participa" },
        { label: "Aporte recibido" },
      ]}
      titulo="Recibimos tu aporte"
      ancho="max-w-2xl"
    >
      <Suspense fallback={<FormularioSkeleton campos={3} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const u = await getUsuario();
  if (!u) redirect("/ingresar?volver=/participa");
  const { folio } = await searchParams;
  const p = typeof folio === "string" ? await getParticipacion(folio) : undefined;

  if (!p) {
    return (
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold text-noche">
          No encontramos ese folio
        </h2>
        <p className="mt-2 text-tinta">Solo puedes ver los aportes enviados desde tu cuenta.</p>
        <Link
          href="/participa"
          className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-rojo px-6 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          Ir a Participa
        </Link>
      </div>
    );
  }

  const filas: [string, string][] = [
    ["Tipo", NOMBRE_TIPO_PARTICIPACION[p.tipo]],
    ...(p.noticia ? ([["Noticia", p.noticia.titulo]] as [string, string][]) : []),
    ["Parroquia", p.parroquia],
    ["Sector", p.sector],
    ["Categoría técnica", p.categoriaTecnica],
    ["Enviado por", p.autor],
    ["Fecha", formatearFechaHora(p.creadaEl)],
    ["Estado", "Pendiente de revisión"],
    ["Nombre público", p.mostrarNombre ? "Autorizado" : "No autorizado"],
  ];

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-exito/15 text-exito-oscuro">
          <CircleCheck size={32} aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-semibold tracking-wide text-tinta/80 uppercase">
          Folio único
        </p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-tight text-noche tabular-nums sm:text-5xl">
          {p.folio}
        </p>
        <div className="mt-4">
          <CopiarFolio folio={p.folio} />
        </div>
        <p className="mt-6 flex items-start gap-2 text-left text-sm leading-relaxed text-tinta">
          <Mail size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
          <span>
            Te enviamos el acuse de recibo a <strong className="text-noche">{u.correo}</strong>.
            Guarda el folio: con él puedes consultar el estado de tu aporte.
          </span>
        </p>
      </div>

      <section aria-labelledby="resumen" className="mt-8 rounded-2xl bg-superficie p-5">
        <h2 id="resumen" className="font-display font-extrabold text-noche">
          Comprobante
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {filas.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-tinta/75">{k}</dt>
              <dd className="font-semibold break-words text-noche">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 border-t border-linea pt-4">
          <p className="text-sm text-tinta/75">
            {p.tipo === "PROPUESTA_FORMAL" ? "Propuesta" : "Opinión"}
          </p>
          <p className="mt-1 leading-relaxed whitespace-pre-line text-noche">{p.descripcion}</p>
        </div>
        {(p.soporte || p.imagenes.length > 0 || p.video) && (
          <ul className="mt-4 space-y-2 border-t border-linea pt-4 text-sm text-tinta">
            {p.soporte && (
              <li className="flex items-start gap-2">
                <FileText size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
                <span>
                  Soporte: <span className="font-semibold text-noche">{p.soporte.nombre}</span> (
                  {formatearPeso(p.soporte.tamano)})
                </span>
              </li>
            )}
            {p.imagenes.length > 0 && (
              <li className="flex items-start gap-2">
                <ImageIcon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
                <span>
                  {p.imagenes.length === 1 ? "1 foto" : `${p.imagenes.length} fotos`}:{" "}
                  <span className="font-semibold break-words text-noche">
                    {p.imagenes.map((i) => i.nombre).join(", ")}
                  </span>
                </span>
              </li>
            )}
            {p.video && (
              <li className="flex items-start gap-2">
                <Video size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
                <span>
                  Video en {p.video.fuente === "YOUTUBE" ? "YouTube" : "Instagram"}:{" "}
                  <a
                    href={p.video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold break-all text-rojo underline underline-offset-2"
                  >
                    {p.video.url}
                    <span className="sr-only"> (se abre en otra pestaña)</span>
                  </a>
                </span>
              </li>
            )}
          </ul>
        )}
        <p className="mt-4 text-sm text-tinta/80">
          El aporte quedó registrado tal como lo enviaste: no se puede editar ni eliminar.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
        <Imprimir />
        <Link
          href="/participa"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel hover:bg-rojo-oscuro"
        >
          <MessageSquareText size={18} aria-hidden="true" />
          Enviar otro aporte
        </Link>
      </div>
      <p className="mt-4 text-center text-sm text-tinta/75 print:hidden">
        Pronto podrás seguir el estado de tus aportes en «Mis participaciones».
      </p>
    </div>
  );
}
