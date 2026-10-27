import { CircleCheck, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormIngreso } from "@/components/cuenta/formularios";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { soloInvitados } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function IngresarPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Iniciar sesión" }]}
      titulo="Inicia sesión"
      bajada="Usa la misma cuenta en cualquier portal de alcaldía de la plataforma."
    >
      <Suspense fallback={<FormularioSkeleton campos={2} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const volver = typeof sp.volver === "string" ? sp.volver : undefined;
  await soloInvitados(volver);

  return (
    <>
      {sp.motivo === "participar" && (
        <p className="mb-6 flex items-start gap-3 rounded-2xl bg-superficie p-4 text-sm leading-relaxed text-noche">
          <Lock size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
          <span>
            <strong className="font-semibold">Para participar necesitas una cuenta.</strong> Así
            cada aporte recibe un folio, queda a tu nombre y te avisamos de su respuesta.
          </span>
        </p>
      )}
      {sp.aviso === "contrasena" && (
        <p
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl bg-exito/10 p-4 text-sm text-noche ring-1 ring-exito/30 ring-inset"
        >
          <CircleCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-exito-oscuro" />
          Tu contraseña se cambió. Inicia sesión con la nueva.
        </p>
      )}
      {sp.aviso === "sesiones" && (
        <p
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl bg-exito/10 p-4 text-sm text-noche ring-1 ring-exito/30 ring-inset"
        >
          <CircleCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-exito-oscuro" />
          Cerramos tu sesión en todos tus dispositivos. Vuelve a ingresar.
        </p>
      )}
      <FormIngreso volver={volver} />
      <p className="mt-8 border-t border-linea pt-6 text-center text-sm text-tinta">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-rojo hover:underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}
