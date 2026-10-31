import { CircleAlert, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormRestablecer } from "@/components/cuenta/formularios";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { estadoRestablecer } from "@/lib/auth/servicio";
import { almacen, soloInvitados } from "@/lib/auth/sesion";
import { pedirApi, usaApi, type EstadoEnlace } from "@/lib/plataforma-api/cliente";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function RestablecerPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Nueva contraseña" }]}
      titulo="Crea una contraseña nueva"
    >
      <Suspense fallback={<FormularioSkeleton campos={2} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

/** Estado del enlace sin gastarlo: el formulario solo se muestra si sirve. */
async function estadoDelEnlace(t: string): Promise<EstadoEnlace> {
  if (!t) return "INVALIDO";
  if (!usaApi()) return estadoRestablecer(almacen(), t);
  const r = await pedirApi<{ estado: EstadoEnlace }>("/portal/auth/reset/estado", {
    cuerpo: { token: t },
    portal: true,
  }).catch(() => ({ estado: "INVALIDO" as const }));
  return r.estado;
}

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  // El estado del enlace depende de la hora actual: se calcula siempre al pedir la página.
  await connection();
  // Con la sesión abierta, la contraseña se cambia desde Seguridad.
  await soloInvitados("/mi-cuenta/seguridad");
  const token = (await searchParams).token;
  const t = typeof token === "string" ? token : "";
  const estado = await estadoDelEnlace(t);

  if (estado === "OK") return <FormRestablecer token={t} />;

  const vencido = estado === "VENCIDO";
  const Icon = vencido ? Clock : CircleAlert;
  return (
    <div className="text-center" role="status">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-amarillo/25 text-fuerte">
        <Icon size={30} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold text-fuerte">
        {vencido
          ? "Este enlace venció"
          : estado === "USADO"
            ? "Este enlace ya se usó"
            : "El enlace no es válido"}
      </h2>
      <p className="mt-2 leading-relaxed text-tinta">
        Los enlaces para cambiar la contraseña duran 1 hora y sirven una sola vez.
      </p>
      <Link
        href="/recuperar"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98]"
      >
        Pedir un enlace nuevo
      </Link>
    </div>
  );
}
