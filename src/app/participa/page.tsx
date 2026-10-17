import { ClipboardCheck, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { getUsuario } from "@/lib/auth/sesion";

export const metadata: Metadata = {
  title: "Participa",
  description: "Envía tu opinión o una propuesta formal al PDUL de Iribarren.",
};

/*
 * Puerta de «Participa» (v3, rol 1, paso 5): sin sesión, lleva a iniciar sesión con el aviso.
 * Con sesión muestra el estado del perfil; el formulario de participación es el punto 3.10.
 */
export default function ParticipaPage() {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Participa" }]}
      titulo="Participa en el PDUL"
      bajada="Envía una opinión general, opina sobre una noticia o presenta una propuesta formal con su soporte."
      ancho="max-w-2xl"
    >
      <Suspense fallback={<FormularioSkeleton campos={2} />}>
        <Contenido />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido() {
  const u = await getUsuario();
  if (!u) redirect("/ingresar?volver=/participa&motivo=participar");

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-full bg-rojo/10 text-rojo">
        <MessageSquareText size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold text-noche">
        {u.perfilCompleto
          ? "Todo listo para participar"
          : "Antes de participar, completa tu perfil"}
      </h2>
      <p className="mt-3 leading-relaxed text-tinta">
        {u.perfilCompleto
          ? "El formulario de participación llega en la próxima entrega. Cada aporte recibirá un folio único y un acuse por correo."
          : "Necesitamos algunos datos más para que tu aporte llegue con respaldo. Puedes verlos en Mi cuenta."}
      </p>
      <Link
        href="/mi-cuenta"
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98]"
      >
        <ClipboardCheck size={18} aria-hidden="true" />
        Ir a Mi cuenta
      </Link>
    </div>
  );
}
