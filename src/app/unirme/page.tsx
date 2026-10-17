import { Building, Link2 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { cerrarSesionAccion, unirseAccion } from "@/lib/auth/acciones";
import { getUsuario } from "@/lib/auth/sesion";

export const metadata: Metadata = {
  title: "Unirme al portal de Iribarren",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function UnirmePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Unirme" }]}
      titulo="Únete al portal de Iribarren"
    >
      <Suspense fallback={<FormularioSkeleton campos={1} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar");
  const volver = (await searchParams).volver;

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-full bg-rojo/10 text-rojo">
        <Link2 size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold text-noche">
        Hola, {usuario.corto}. Tu cuenta ya existe en otro portal.
      </h2>
      <p className="mt-3 leading-relaxed text-tinta">
        Para participar en el PDUL de Iribarren, une tu cuenta a esta alcaldía. Usarás el mismo
        correo y la misma contraseña; tus datos de perfil se comparten y tus aportes de cada
        alcaldía se mantienen separados.
      </p>
      <ul className="mt-5 space-y-2 rounded-2xl bg-superficie p-4 text-sm text-noche">
        <li className="flex items-center gap-2">
          <Building size={16} aria-hidden="true" className="text-rojo" />
          Alcaldía Bolivariana de Iribarren · Portal PDUL YA
        </li>
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
        <form action={unirseAccion} className="flex-1">
          {typeof volver === "string" && <input type="hidden" name="volver" value={volver} />}
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98]"
          >
            Unirme a Iribarren
          </button>
        </form>
        <form action={cerrarSesionAccion} className="flex-1">
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl border-2 border-linea px-6 font-display font-bold text-noche transition-colors hover:border-noche/40"
          >
            Ahora no
          </button>
        </form>
      </div>
    </div>
  );
}
