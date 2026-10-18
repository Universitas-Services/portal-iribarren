import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormReenviar } from "@/components/cuenta/formularios";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { leerAviso, soloInvitados } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Revisa tu correo", robots: { index: false } };

export default function RevisaTuCorreoPage() {
  return (
    <MarcoCuenta
      migas={[
        { href: "/", label: "Inicio" },
        { href: "/registro", label: "Regístrate" },
        { label: "Revisa tu correo" },
      ]}
      titulo="Revisa tu correo"
    >
      <Suspense fallback={<FormularioSkeleton campos={1} />}>
        <Contenido />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido() {
  await soloInvitados();
  const aviso = await leerAviso();
  return (
    <div className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-rojo/10 text-rojo">
        <MailCheck size={30} aria-hidden="true" />
      </span>
      <p className="mt-5 text-lg leading-relaxed text-noche">
        Si los datos son correctos, te enviamos un enlace para verificar tu correo
        {aviso?.correo ? (
          <>
            {" "}
            a <strong className="font-semibold">{aviso.correo}</strong>
          </>
        ) : null}
        .
      </p>
      <p className="mt-2 text-sm leading-relaxed text-tinta">
        Ábrelo en las próximas 24 horas. Si no lo ves, revisa la carpeta de correo no deseado.
      </p>
      <div className="text-left">
        <FormReenviar enlaceInicial={aviso?.enlaceDesarrollo} />
      </div>
      <p className="mt-8 text-sm text-tinta">
        ¿Ya lo verificaste?{" "}
        <Link href="/ingresar" className="font-semibold text-rojo hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
