import { CircleAlert, CircleCheck, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormReenviar } from "@/components/cuenta/formularios";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { correoDeToken, verificarCorreo } from "@/lib/auth/servicio";
import { almacen } from "@/lib/auth/sesion";
import { pedirApi, usaApi, type EstadoEnlace } from "@/lib/plataforma-api/cliente";

export const metadata: Metadata = { title: "Verificar correo", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function VerificarPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Verificar correo" }]}
      titulo="Verificación de correo"
    >
      <Suspense fallback={<FormularioSkeleton campos={1} />}>
        <Resultado searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

/** Gasta el enlace y dice cómo quedó; con VENCIDO, el correo para pedir otro. */
async function estadoDeVerificacion(t: string): Promise<{ estado: EstadoEnlace; correo?: string }> {
  if (!t) return { estado: "INVALIDO" };
  if (usaApi()) {
    const r = await pedirApi<{ estado: EstadoEnlace; email?: string }>("/portal/auth/verify", {
      cuerpo: { token: t },
      portal: true,
    }).catch(() => ({ estado: "INVALIDO" as const, email: undefined }));
    return { estado: r.estado, correo: r.email };
  }
  const alm = almacen();
  const correo = correoDeToken(alm, t);
  return { estado: verificarCorreo(alm, t), correo };
}

async function Resultado({ searchParams }: { searchParams: SearchParams }) {
  // El estado del enlace depende de la hora actual: se calcula siempre al pedir la página.
  await connection();
  const token = (await searchParams).token;
  const t = typeof token === "string" ? token : "";
  const { estado, correo } = await estadoDeVerificacion(t);

  const vistas = {
    OK: {
      Icon: CircleCheck,
      color: "bg-exito/10 text-exito-oscuro",
      titulo: "¡Listo! Tu correo está verificado",
      texto:
        "Ya puedes iniciar sesión y opinar. Para enviar propuestas formales, completa tu perfil y carga tus documentos en Mi cuenta.",
    },
    VENCIDO: {
      Icon: Clock,
      color: "bg-amarillo/25 text-fuerte",
      titulo: "Este enlace venció",
      texto: "Los enlaces de verificación duran 24 horas. Pide uno nuevo.",
    },
    USADO: {
      Icon: CircleCheck,
      color: "bg-superficie text-tinta",
      titulo: "Este enlace ya se usó",
      texto: "Tu correo ya estaba verificado. Inicia sesión para continuar.",
    },
    INVALIDO: {
      Icon: CircleAlert,
      color: "bg-rojo/10 text-enlace",
      titulo: "El enlace no es válido",
      texto: "Revisa que lo hayas copiado completo o regístrate de nuevo.",
    },
  } as const;
  const v = vistas[estado];

  return (
    <div className="text-center" role="status">
      <span className={`mx-auto grid size-16 place-items-center rounded-full ${v.color}`}>
        <v.Icon size={30} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold text-fuerte">{v.titulo}</h2>
      <p className="mt-2 leading-relaxed text-tinta">{v.texto}</p>
      {estado === "VENCIDO" ? (
        <div className="text-left">
          <FormReenviar correo={correo} />
        </div>
      ) : (
        <Link
          href={estado === "INVALIDO" ? "/registro" : "/ingresar"}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.98]"
        >
          {estado === "INVALIDO" ? "Ir al registro" : "Iniciar sesión"}
        </Link>
      )}
    </div>
  );
}
