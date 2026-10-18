"use client";

import { useActionState } from "react";
import { cambiarContrasenaAccion, type EstadoFormulario } from "@/lib/auth/acciones";
import { BotonEnviar, CampoContrasena, ResumenErrores } from "./campos";

const inicial: EstadoFormulario = {};

/** Cambio de contraseña con la sesión abierta: pide la actual y cierra las demás sesiones. */
export function FormCambiarContrasena({ correo }: { correo: string }) {
  const [estado, accion] = useActionState(cambiarContrasenaAccion, inicial);
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      {/* Para que el gestor de contraseñas asocie la nueva clave a esta cuenta. */}
      <input type="email" name="usuario" autoComplete="username" value={correo} readOnly hidden />
      <CampoContrasena
        id="contrasenaActual"
        etiqueta="Contraseña actual"
        autoComplete="current-password"
        error={estado.errores?.contrasenaActual}
      />
      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña nueva"
        nueva
        autoComplete="new-password"
        error={estado.errores?.contrasena}
      />
      <CampoContrasena
        id="confirmarContrasena"
        etiqueta="Repite la contraseña nueva"
        autoComplete="new-password"
        error={estado.errores?.confirmarContrasena}
      />
      <BotonEnviar enviando="Guardando…">Cambiar contraseña</BotonEnviar>
    </form>
  );
}
