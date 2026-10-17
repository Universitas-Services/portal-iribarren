import type { Metadata } from "next";
import Link from "next/link";
import { FormRecuperar } from "@/components/cuenta/formularios";
import { MarcoCuenta } from "@/components/cuenta/marco-cuenta";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <MarcoCuenta
      migas={[
        { href: "/", label: "Inicio" },
        { href: "/ingresar", label: "Iniciar sesión" },
        { label: "Recuperar" },
      ]}
      titulo="¿Olvidaste tu contraseña?"
      bajada="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva."
    >
      <FormRecuperar />
      <p className="mt-8 border-t border-linea pt-6 text-center text-sm text-tinta">
        ¿La recordaste?{" "}
        <Link href="/ingresar" className="font-semibold text-rojo hover:underline">
          Inicia sesión
        </Link>
      </p>
    </MarcoCuenta>
  );
}
