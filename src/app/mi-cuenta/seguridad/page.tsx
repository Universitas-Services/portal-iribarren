import { CircleCheck, KeyRound, LogOut, Mail } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { ZonaCuenta } from "@/components/cuenta/perfil";
import { FormCambiarContrasena } from "@/components/cuenta/seguridad";
import { cerrarSesionAccion } from "@/lib/auth/acciones";
import { getPerfil } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Seguridad de la cuenta", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Mi cuenta › Seguridad: datos de acceso, contraseña y opciones de la cuenta. */
export default function SeguridadPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[
        { href: "/", label: "Inicio" },
        { href: "/mi-cuenta", label: "Mi cuenta" },
        { label: "Seguridad" },
      ]}
      titulo="Seguridad"
      ancho="max-w-2xl"
      pestana="seguridad"
    >
      <Suspense fallback={<FormularioSkeleton campos={3} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

const AVISOS: Record<string, string> = {
  contrasena: "Contraseña actualizada. Cerramos tu sesión en los demás dispositivos.",
  baja: "Recibimos tu solicitud de baja. Te escribiremos al correo de la cuenta.",
};

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const u = await getPerfil();
  if (!u) redirect("/ingresar?volver=/mi-cuenta/seguridad");
  const { guardado } = await searchParams;
  const aviso = typeof guardado === "string" ? AVISOS[guardado] : undefined;

  return (
    <div className="space-y-10">
      {aviso && (
        <p
          role="status"
          className="flex items-center gap-3 rounded-2xl bg-exito/10 p-4 text-sm text-fuerte ring-1 ring-exito/30 ring-inset"
        >
          <CircleCheck size={20} aria-hidden="true" className="shrink-0 text-exito-oscuro" />
          {aviso}
        </p>
      )}

      <section aria-labelledby="acceso">
        <h2
          id="acceso"
          className="flex items-center gap-2 font-display text-xl font-extrabold text-fuerte"
        >
          <Mail size={20} aria-hidden="true" className="text-enlace" />
          Correo de acceso
        </h2>
        <p className="mt-3 font-semibold break-words text-fuerte">{u.correo}</p>
        <p className="mt-1 text-sm text-tinta/80">
          Con él inicias sesión y recibes las respuestas a tus aportes. Para cambiarlo, escribe a la
          alcaldía (su contacto está al pie de la página).
        </p>
      </section>

      <section aria-labelledby="contrasena-titulo" className="border-t border-linea pt-8">
        <h2
          id="contrasena-titulo"
          className="flex items-center gap-2 font-display text-xl font-extrabold text-fuerte"
        >
          <KeyRound size={20} aria-hidden="true" className="text-enlace" />
          Cambiar contraseña
        </h2>
        <p className="mt-2 mb-5 text-sm text-tinta/80">
          Al cambiarla, cerramos tu sesión en los demás dispositivos. Esta sigue abierta.
        </p>
        <FormCambiarContrasena correo={u.correo} />
      </section>

      <section aria-labelledby="zona-cuenta" className="border-t border-linea pt-8">
        <h2 id="zona-cuenta" className="mb-2 font-display text-xl font-extrabold text-fuerte">
          Tu cuenta
        </h2>
        <form action={cerrarSesionAccion}>
          <button
            type="submit"
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-fuerte hover:bg-superficie"
          >
            <LogOut size={18} aria-hidden="true" className="shrink-0 text-enlace" />
            Cerrar sesión
          </button>
        </form>
        <ZonaCuenta bajaSolicitada={u.bajaSolicitada} />
      </section>
    </div>
  );
}
