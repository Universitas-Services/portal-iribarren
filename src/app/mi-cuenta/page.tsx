import { CircleCheck, ClipboardList, LogOut, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { cerrarSesionAccion } from "@/lib/auth/acciones";
import { getUsuario } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default function MiCuentaPage() {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Mi cuenta" }]}
      titulo="Mi cuenta"
      ancho="max-w-2xl"
    >
      <Suspense fallback={<FormularioSkeleton campos={3} />}>
        <Contenido />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido() {
  const u = await getUsuario();
  if (!u) redirect("/ingresar?volver=/mi-cuenta");

  return (
    <div>
      <p className="text-sm text-tinta/75">
        {u.tipo === "NATURAL" ? "Persona natural" : "Organización"} · {u.correo}
      </p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-noche">Hola, {u.corto}</h2>

      {u.perfilCompleto ? (
        <p className="mt-6 flex items-start gap-3 rounded-2xl bg-exito/10 p-4 text-noche ring-1 ring-exito/30 ring-inset">
          <CircleCheck size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-exito-oscuro" />
          <span>
            <strong className="font-semibold">Tu perfil está completo.</strong> Ya puedes opinar y
            enviar propuestas.
          </span>
        </p>
      ) : (
        <section
          aria-labelledby="perfil-pendiente"
          className="mt-6 rounded-2xl bg-amarillo/15 p-5 ring-1 ring-amarillo/60 ring-inset"
        >
          <h3 id="perfil-pendiente" className="font-display font-extrabold text-noche">
            Completa tu perfil para participar
          </h3>
          <p className="mt-1 text-sm text-tinta">Te falta:</p>
          <ul className="mt-3 space-y-2">
            {u.faltantes.map((f) => (
              <li key={f} className="flex items-start gap-2 text-noche">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-rojo" />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-tinta/80">
            El asistente para completar el perfil llega en la próxima entrega.
          </p>
        </section>
      )}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
          <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-dashed border-linea px-4 font-display font-bold text-tinta/60">
            <ClipboardList size={20} aria-hidden="true" />
            Mis participaciones (próximamente)
          </span>
        </li>
      </ul>

      <form action={cerrarSesionAccion} className="mt-8 border-t border-linea pt-6">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-2 font-display font-bold text-tinta hover:text-rojo"
        >
          <LogOut size={18} aria-hidden="true" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
