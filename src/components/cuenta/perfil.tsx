"use client";

import { UserX } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ACREDITACION_REPRESENTANTE,
  CONDICIONES_REPRESENTANTE,
  OCUPACIONES,
} from "@/lib/api/types";
import {
  cargarDocumentoAccion,
  guardarAcreditacionAccion,
  guardarDatosNaturalAccion,
  guardarNombresAccion,
  guardarRepresentanteAccion,
  solicitarBajaAccion,
  type EstadoFormulario,
} from "@/lib/auth/acciones";
import type { DocumentoCargado, Perfil, TipoDocumento } from "@/lib/auth/servicio";
import { nombrePersonaSchema, telefonoSchema } from "@/lib/validation/common";
import { BotonEnviar, Campo, CampoDocumento, ResumenErrores, soloLetras } from "./campos";
import { CampoArchivo, CampoSelect, Dialogo } from "./piezas";

const inicial: EstadoFormulario = {};

/** Máscara 04XX-XXXXXXX / 0251-XXXXXXX mientras se escribe. */
export function mascaraTelefono(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

function CampoTelefono({
  id,
  etiqueta,
  valor,
  error,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor?: string;
  error?: string;
  ayuda: string;
}) {
  return (
    <Campo
      id={id}
      etiqueta={etiqueta}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      required
      maxLength={12}
      placeholder="0414-1234567"
      defaultValue={valor ? mascaraTelefono(valor) : undefined}
      filtrar={mascaraTelefono}
      esquema={telefonoSchema}
      ayuda={ayuda}
      error={error}
    />
  );
}

/** Persona natural: corrige nombres y apellidos. La cédula no se edita. */
export function FormNombres({ nombres, apellidos }: { nombres?: string; apellidos?: string }) {
  const [estado, accion] = useActionState(guardarNombresAccion, inicial);
  const v = estado.valores ?? {};
  const filtro = {
    required: true,
    maxLength: 100,
    esquema: nombrePersonaSchema,
    filtrar: soloLetras,
    avisoFiltro: "Solo letras y espacios: sin números ni símbolos.",
  };
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          defaultValue={v.nombres ?? nombres}
          error={estado.errores?.nombres}
          {...filtro}
        />
        <Campo
          id="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          defaultValue={v.apellidos ?? apellidos}
          error={estado.errores?.apellidos}
          {...filtro}
        />
      </div>
      <p className="text-sm text-tinta/80">
        Escríbelos como aparecen en tu cédula. Para corregir la cédula, escribe a soporte.
      </p>
      <BotonEnviar enviando="Guardando…">Guardar nombres</BotonEnviar>
    </form>
  );
}

/** Persona natural, paso 1: teléfono y ocupación. */
export function FormDatosNatural({ perfil }: { perfil: Perfil }) {
  const [estado, accion] = useActionState(guardarDatosNaturalAccion, inicial);
  const v = estado.valores ?? {};
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <CampoTelefono
        id="telefono"
        etiqueta="Teléfono de contacto"
        valor={v.telefono ?? perfil.telefono}
        ayuda="Celular o fijo con el código de área: 0414-1234567 o 0251-2345678."
        error={estado.errores?.telefono}
      />
      <CampoSelect
        id="ocupacion"
        etiqueta="Ocupación (opcional)"
        opciones={OCUPACIONES}
        vacio="Prefiero no indicarla"
        permitirVacio
        defaultValue={v.ocupacion ?? perfil.ocupacion ?? ""}
        error={estado.errores?.ocupacion}
      />
      <BotonEnviar enviando="Guardando…">Guardar datos</BotonEnviar>
    </form>
  );
}

/** Organización, paso 1: quién la representa y el teléfono institucional. */
export function FormRepresentante({ perfil }: { perfil: Perfil }) {
  const [estado, accion] = useActionState(guardarRepresentanteAccion, inicial);
  const v = estado.valores ?? {};
  const [prefijo, ...numero] = (perfil.cedulaRepresentante ?? "").split("-");
  const filtroNombre = {
    maxLength: 100,
    esquema: nombrePersonaSchema,
    filtrar: soloLetras,
    avisoFiltro: "Solo letras y espacios: sin números ni símbolos.",
  };
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <CampoSelect
        id="condicion"
        etiqueta="¿En qué condición actúas en nombre de la organización?"
        opciones={CONDICIONES_REPRESENTANTE}
        defaultValue={v.condicion ?? perfil.condicion ?? ""}
        error={estado.errores?.condicion}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="nombresRepresentante"
          etiqueta="Nombres"
          autoComplete="given-name"
          required
          defaultValue={v.nombresRepresentante ?? perfil.nombresRepresentante}
          error={estado.errores?.nombresRepresentante}
          {...filtroNombre}
        />
        <Campo
          id="apellidosRepresentante"
          etiqueta="Apellidos"
          autoComplete="family-name"
          required
          defaultValue={v.apellidosRepresentante ?? perfil.apellidosRepresentante}
          error={estado.errores?.apellidosRepresentante}
          {...filtroNombre}
        />
      </div>
      <CampoDocumento
        id="cedulaRepresentante"
        tipo="cedula"
        etiqueta="Cédula de identidad"
        prefijos={["V", "E"]}
        valorPrefijo={v.cedulaRepresentantePrefijo ?? (prefijo || undefined)}
        valorNumero={v.cedulaRepresentanteNumero ?? numero.join("")}
        placeholder="12345678"
        ayuda="Tal como aparece en el documento, sin puntos."
        error={estado.errores?.cedulaRepresentante}
      />
      <CampoTelefono
        id="telefonoInstitucional"
        etiqueta="Teléfono institucional"
        valor={v.telefonoInstitucional ?? perfil.telefonoInstitucional}
        ayuda="Con el código de área, por ejemplo 0251-2345678."
        error={estado.errores?.telefonoInstitucional}
      />
      <BotonEnviar enviando="Guardando…">Guardar datos del representante</BotonEnviar>
    </form>
  );
}

/** Organización, paso 2: ¿tiene un documento que acredite su condición? */
export function FormAcreditacion({
  perfil,
  actual,
}: {
  perfil: Perfil;
  actual?: DocumentoCargado;
}) {
  const [estado, accion] = useActionState(guardarAcreditacionAccion, inicial);
  const [respuesta, setRespuesta] = useState(
    estado.valores?.acreditacion ?? perfil.acreditacion ?? "",
  );
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <fieldset aria-describedby={estado.errores?.acreditacion ? "acreditacion-error" : undefined}>
        <legend className="mb-2 font-display text-sm font-bold text-noche">
          ¿Tienes un documento que acredite tu condición de representante, vocero o persona
          autorizada?
        </legend>
        <div className="flex flex-wrap gap-2">
          {ACREDITACION_REPRESENTANTE.map((o) => (
            <label
              key={o}
              className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-linea px-4 font-semibold text-noche has-[:checked]:border-rojo has-[:checked]:bg-rojo/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rojo"
            >
              <input
                type="radio"
                name="acreditacion"
                value={o}
                checked={respuesta === o}
                onChange={() => setRespuesta(o)}
                className="size-4 accent-rojo"
              />
              {o}
            </label>
          ))}
        </div>
        {estado.errores?.acreditacion && (
          <p id="acreditacion-error" className="mt-1.5 text-sm text-rojo">
            {estado.errores.acreditacion}
          </p>
        )}
      </fieldset>
      {respuesta === "Sí" && (
        <CampoArchivo
          id="archivo"
          etiqueta="Documento que acredita tu condición"
          ayuda="Acta de asamblea, carta aval o poder. PDF, JPG o PNG de hasta 2 MB."
          requerido={!actual}
          actual={actual}
          error={estado.errores?.archivo}
        />
      )}
      <BotonEnviar enviando="Guardando…">Guardar acreditación</BotonEnviar>
    </form>
  );
}

/** Sube o reemplaza un documento del perfil. */
export function FormDocumento({
  documento,
  etiqueta,
  ayuda,
  actual,
}: {
  documento: TipoDocumento;
  etiqueta: string;
  ayuda: string;
  actual?: DocumentoCargado;
}) {
  const [estado, accion] = useActionState(cargarDocumentoAccion, inicial);
  const [hay, setHay] = useState(false);
  return (
    <form action={accion} noValidate className="space-y-5">
      <ResumenErrores estado={estado} />
      <input type="hidden" name="documento" value={documento} />
      <CampoArchivo
        id={`archivo-${documento}`}
        name="archivo"
        etiqueta={etiqueta}
        ayuda={ayuda}
        requerido
        actual={actual}
        error={estado.errores?.archivo}
        onCambio={setHay}
      />
      {(hay || !actual) && (
        <BotonEnviar enviando="Subiendo…">
          {actual ? "Subir versión nueva" : "Subir documento"}
        </BotonEnviar>
      )}
    </form>
  );
}

function BotonConfirmar({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 flex-1 rounded-xl bg-rojo px-5 font-display font-bold text-papel hover:bg-rojo-oscuro disabled:opacity-70"
    >
      {pending ? "Un momento…" : children}
    </button>
  );
}

const claseSecundario =
  "min-h-12 flex-1 rounded-xl border-2 border-linea px-5 font-display font-bold text-noche hover:border-noche/40";

/** Pedir la baja de la cuenta, con confirmación. */
export function ZonaCuenta({ bajaSolicitada }: { bajaSolicitada?: string }) {
  const [dialogo, setDialogo] = useState<"baja" | null>(null);
  const cerrar = () => setDialogo(null);
  const claseOpcion =
    "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-noche hover:bg-superficie";
  return (
    <div className="space-y-1">
      {bajaSolicitada ? (
        <p className="flex min-h-12 items-center gap-3 px-3 text-sm text-tinta/80">
          <UserX size={18} aria-hidden="true" className="shrink-0" />
          Pediste la baja de la cuenta; la alcaldía te escribirá para confirmarla.
        </p>
      ) : (
        <button type="button" onClick={() => setDialogo("baja")} className={claseOpcion}>
          <UserX size={18} aria-hidden="true" className="shrink-0 text-rojo" />
          Solicitar la baja de la cuenta
        </button>
      )}

      <Dialogo
        abierto={dialogo === "baja"}
        onCerrar={cerrar}
        titulo="¿Solicitar la baja de tu cuenta?"
      >
        <p className="mt-3 leading-relaxed">
          La alcaldía revisará la solicitud y te escribirá al correo de la cuenta. Al darse de baja
          ya no podrás iniciar sesión en el portal. Los aportes que enviaste se conservan con su
          folio.
        </p>
        <form action={solicitarBajaAccion} className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <BotonConfirmar>Sí, solicitar la baja</BotonConfirmar>
          <button type="button" onClick={cerrar} className={claseSecundario} autoFocus>
            Cancelar
          </button>
        </form>
      </Dialogo>
    </div>
  );
}
