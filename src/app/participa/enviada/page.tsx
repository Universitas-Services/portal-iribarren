import { CircleCheck, Mail, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { CopiarFolio, Imprimir } from "@/components/cuenta/participacion";
import { FichaAporte } from "@/components/participacion/aporte";
import { getParticipacion, getUsuario } from "@/lib/auth/sesion";
import { formatearFechaHora } from "@/lib/formato";
import { AUTOR_ANONIMO } from "@/lib/participacion";

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

      <div className="mt-8">
        <FichaAporte
          aporte={p}
          extra={[
            ["Enviado por", p.autor],
            ["Fecha", formatearFechaHora(p.creadaEl)],
            ["Estado", "Pendiente de revisión"],
            [
              "Nombre público",
              p.mostrarNombre ? "Sí, con tu nombre" : `No, como «${AUTOR_ANONIMO}»`,
            ],
          ]}
          pie="El aporte quedó registrado tal como lo enviaste: no se puede editar ni eliminar."
        />
      </div>

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
      <p className="mt-4 text-center text-sm text-tinta print:hidden">
        Sigue su estado en{" "}
        <Link
          href={`/mi-cuenta/participaciones/${p.folio}`}
          className="font-semibold text-rojo underline underline-offset-2"
        >
          Mis participaciones
        </Link>
        .
      </p>
    </div>
  );
}
