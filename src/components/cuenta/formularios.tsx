"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  ingresarAccion,
  recuperarAccion,
  reenviarAccion,
  registrarNaturalAccion,
  registrarOrganizacionAccion,
  restablecerAccion,
  type EstadoFormulario,
} from "@/lib/auth/acciones";
import { correoSchema, nombrePersonaSchema } from "@/lib/validation/common";
import type { TextoLegal, TipoTextoLegal } from "@/lib/api/types";
import { ModalTextoLegal } from "./texto-legal";
import { CampoSelect } from "./piezas";
import {
  AvisoDesarrollo,
  BotonEnviar,
  Campo,
  CampoContrasena,
  CampoDocumento,
  Casilla,
  ResumenErrores,
  soloLetras,
} from "./campos";

const inicial: EstadoFormulario = {};

/** Los textos vigentes que se aceptan al registrarse; null si no se pudieron leer. */
export type TextosRegistro = Record<TipoTextoLegal, TextoLegal | null>;

/**
 * Las dos aceptaciones. Cada texto se lee en un modal, sin salir del formulario; el botón está
 * fuera de la casilla, así abrirlo no la marca. Se envía la versión que la persona vio.
 */
function Aceptaciones({ estado, textos }: { estado: EstadoFormulario; textos: TextosRegistro }) {
  const [abierto, setAbierto] = useState<TipoTextoLegal | null>(null);
  const v = estado.valores ?? {};
  const enlace =
    "font-semibold text-rojo underline underline-offset-2 hover:text-rojo-oscuro cursor-pointer";
  const leer = (tipo: TipoTextoLegal, texto: string) => (
    <button
      type="button"
      onClick={(e) => {
        // Dentro de la etiqueta: abrir el texto no marca la casilla.
        e.preventDefault();
        setAbierto(tipo);
      }}
      aria-haspopup="dialog"
      className={enlace}
    >
      {texto}
    </button>
  );
  return (
    <div className="space-y-3 border-t border-linea pt-5">
      <input type="hidden" name="versionTerminos" value={textos.TERMINOS?.version ?? ""} />
      <input
        type="hidden"
        name="versionPoliticaDatos"
        value={textos.POLITICA_DATOS?.version ?? ""}
      />
      <Casilla
        id="aceptaTerminos"
        marcada={v.aceptaTerminos === "on"}
        error={estado.errores?.aceptaTerminos}
      >
        Acepto los {leer("TERMINOS", "términos de uso")}.
      </Casilla>
      <Casilla
        id="aceptaPoliticaDatos"
        marcada={v.aceptaPoliticaDatos === "on"}
        error={estado.errores?.aceptaPoliticaDatos}
      >
        Acepto la {leer("POLITICA_DATOS", "política de tratamiento de datos personales")}.
      </Casilla>
      {(["TERMINOS", "POLITICA_DATOS"] as const).map((tipo) => (
        <ModalTextoLegal
          key={tipo}
          tipo={tipo}
          texto={textos[tipo]}
          abierto={abierto === tipo}
          onCerrar={() => setAbierto(null)}
        />
      ))}
    </div>
  );
}

function Contrasenas({ estado }: { estado: EstadoFormulario }) {
  return (
    <>
      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña"
        nueva
        autoComplete="new-password"
        error={estado.errores?.contrasena}
      />
      <CampoContrasena
        id="confirmarContrasena"
        etiqueta="Repite la contraseña"
        autoComplete="new-password"
        error={estado.errores?.confirmarContrasena}
      />
    </>
  );
}

/** Registro de persona natural (v3: cédula, nombres, apellidos, correo y contraseña). */
export function FormRegistroNatural({ textos }: { textos: TextosRegistro }) {
  const [estado, accion] = useActionState(registrarNaturalAccion, inicial);
  const v = estado.valores ?? {};
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <CampoDocumento
        id="cedula"
        etiqueta="Cédula de identidad"
        prefijos={["V", "E"]}
        valorPrefijo={v.cedulaPrefijo}
        valorNumero={v.cedulaNumero}
        placeholder="12345678"
        ayuda="Solo números, sin puntos: hasta 8 dígitos con V y hasta 9 con E."
        error={estado.errores?.cedula}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          required
          maxLength={100}
          defaultValue={v.nombres}
          esquema={nombrePersonaSchema}
          filtrar={soloLetras}
          avisoFiltro="Solo letras y espacios: sin números ni símbolos."
          error={estado.errores?.nombres}
        />
        <Campo
          id="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          required
          maxLength={100}
          defaultValue={v.apellidos}
          esquema={nombrePersonaSchema}
          filtrar={soloLetras}
          avisoFiltro="Solo letras y espacios: sin números ni símbolos."
          error={estado.errores?.apellidos}
        />
      </div>
      <Campo
        id="correo"
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        maxLength={255}
        defaultValue={v.correo}
        esquema={correoSchema}
        ayuda="Ahí recibirás el enlace de verificación y las respuestas a tus aportes."
        error={estado.errores?.correo}
      />
      <Contrasenas estado={estado} />
      <Aceptaciones estado={estado} textos={textos} />
      <BotonEnviar enviando="Creando tu cuenta…">Crear mi cuenta</BotonEnviar>
    </form>
  );
}

/** Registro de organización (v3: la cuenta usa el correo institucional, sin cédula). */
export function FormRegistroOrganizacion({
  textos,
  tiposEntidad,
}: {
  textos: TextosRegistro;
  /** Los tipos de entidad vigentes de la alcaldía. */
  tiposEntidad: string[];
}) {
  const [estado, accion] = useActionState(registrarOrganizacionAccion, inicial);
  const v = estado.valores ?? {};
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <CampoSelect
        id="tipoEntidad"
        etiqueta="Tipo de entidad u organización"
        opciones={tiposEntidad}
        defaultValue={v.tipoEntidad}
        error={estado.errores?.tipoEntidad}
      />
      <Campo
        id="razonSocial"
        etiqueta="Razón social o denominación oficial"
        autoComplete="organization"
        required
        defaultValue={v.razonSocial}
        error={estado.errores?.razonSocial}
      />
      <CampoDocumento
        id="rif"
        etiqueta="RIF"
        prefijos={["J", "G", "C"]}
        valorPrefijo={v.rifPrefijo}
        valorNumero={v.rifNumero}
        placeholder="12345678-9"
        ayuda="8 números y el dígito verificador. C para consejos comunales y comunas."
        error={estado.errores?.rif}
      />
      <Campo
        id="correo"
        etiqueta="Correo institucional"
        type="email"
        autoComplete="email"
        required
        maxLength={255}
        defaultValue={v.correo}
        esquema={correoSchema}
        ayuda="Será el usuario de la cuenta de la organización."
        error={estado.errores?.correo}
      />
      <Contrasenas estado={estado} />
      <p className="rounded-2xl bg-superficie p-4 text-sm leading-relaxed text-tinta">
        Después de verificar el correo te pediremos los datos de quien representa a la organización
        y el documento que lo acredita.
      </p>
      <Aceptaciones estado={estado} textos={textos} />
      <BotonEnviar enviando="Registrando…">Registrar la organización</BotonEnviar>
    </form>
  );
}

/** Reenvío del enlace de verificación, con 60 s de espera entre envíos. */
export function FormReenviar({
  correo,
  enlaceInicial,
}: {
  correo?: string;
  enlaceInicial?: string;
}) {
  const [estado, accion] = useActionState(reenviarAccion, inicial);
  const [espera, setEspera] = useState(60);

  // Cada envío reinicia la espera.
  const [ultimo, setUltimo] = useState(estado);
  if (estado !== ultimo) {
    setUltimo(estado);
    setEspera(60);
  }
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  return (
    <form action={accion} className="mt-6">
      {correo && <input type="hidden" name="correo" value={correo} />}
      <ResumenErrores estado={estado} />
      <button
        type="submit"
        disabled={espera > 0}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-noche px-6 font-display font-bold text-noche transition-colors hover:bg-noche hover:text-papel disabled:cursor-not-allowed disabled:border-linea disabled:text-tinta/50 disabled:hover:bg-transparent"
      >
        {espera > 0 ? `Reenviar el enlace en ${espera} s` : "Reenviar el enlace"}
      </button>
      <AvisoDesarrollo enlace={estado.enlaceDesarrollo ?? enlaceInicial} />
    </form>
  );
}

export function FormIngreso({ volver }: { volver?: string }) {
  const [estado, accion] = useActionState(ingresarAccion, inicial);
  const v = estado.valores ?? {};
  return (
    <>
      <form action={accion} noValidate className="space-y-5">
        <ResumenErrores estado={estado} />
        {volver && <input type="hidden" name="volver" value={volver} />}
        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          defaultValue={v.correo}
          error={estado.errores?.correo}
        />
        <CampoContrasena
          id="contrasena"
          etiqueta="Contraseña"
          autoComplete="current-password"
          error={estado.errores?.contrasena}
        />
        <div className="flex justify-end">
          <Link href="/recuperar" className="text-sm font-semibold text-rojo hover:underline">
            Olvidé mi contraseña
          </Link>
        </div>
        <BotonEnviar enviando="Entrando…">Iniciar sesión</BotonEnviar>
      </form>
      {estado.noVerificado && <FormReenviar correo={v.correo} />}
    </>
  );
}

export function FormRecuperar() {
  const [estado, accion] = useActionState(recuperarAccion, inicial);
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <Campo
        id="correo"
        etiqueta="Correo de tu cuenta"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado.valores?.correo}
        error={estado.errores?.correo}
      />
      <BotonEnviar enviando="Enviando…">Enviar el enlace</BotonEnviar>
      <AvisoDesarrollo enlace={estado.enlaceDesarrollo} />
    </form>
  );
}

export function FormRestablecer({ token }: { token: string }) {
  const [estado, accion] = useActionState(restablecerAccion, inicial);
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <input type="hidden" name="token" value={token} />
      <Contrasenas estado={estado} />
      <BotonEnviar enviando="Guardando…">Guardar la contraseña nueva</BotonEnviar>
    </form>
  );
}
