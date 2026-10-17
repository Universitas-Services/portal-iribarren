import { ALCALDIA, cifrar, crearAlmacen, type Almacen, type Cuenta } from "./servicio";

/**
 * Cuentas de demostración para probar cada caso del acceso simulado. Las contraseñas están
 * documentadas en el README; todas son datos de ejemplo.
 */
export const CONTRASENA_DEMO = "Iribarren#2026";

const DOC_DEMO = {
  mime: "application/pdf",
  tamano: 412_000,
  version: 1,
  subidoEl: "2026-09-02T14:00:00.000Z",
};

const cuentas: Omit<Cuenta, "hash">[] = [
  {
    id: "demo-ana",
    tipo: "NATURAL",
    correo: "ana@ejemplo.com",
    cedula: "V-12345678",
    nombres: "Ana María",
    apellidos: "Pérez",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: { telefono: "04141234567", ocupacion: "Profesional Independiente" },
    documentos: { IDENTIDAD: { ...DOC_DEMO, nombre: "cedula-ana.pdf" } },
    estadoVerificacion: "VERIFICADO",
  },
  {
    id: "demo-luis",
    tipo: "NATURAL",
    correo: "luis@ejemplo.com",
    cedula: "V-23456789",
    nombres: "Luis",
    apellidos: "Mendoza",
    verificado: false,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
  {
    id: "demo-carla",
    tipo: "NATURAL",
    correo: "carla@ejemplo.com",
    cedula: "V-34567890",
    nombres: "Carla",
    apellidos: "Rodríguez",
    verificado: true,
    membresias: ["palavecino"],
    perfil: { telefono: "04241234567" },
    documentos: { IDENTIDAD: { ...DOC_DEMO, nombre: "cedula-carla.pdf" } },
    estadoVerificacion: "VERIFICADO",
  },
  {
    id: "demo-jose",
    tipo: "NATURAL",
    correo: "jose@ejemplo.com",
    cedula: "V-14567890",
    nombres: "José Gregorio",
    apellidos: "Álvarez",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
  {
    id: "demo-rosa",
    tipo: "NATURAL",
    correo: "rosa@ejemplo.com",
    cedula: "E-81234567",
    nombres: "Rosa",
    apellidos: "Giménez",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: { telefono: "04161234567", ocupacion: "Comerciante" },
    documentos: { IDENTIDAD: { ...DOC_DEMO, mime: "image/jpeg", nombre: "cedula-rosa.jpg" } },
    estadoVerificacion: "REQUIERE_CORRECCION",
    correccion: {
      documento: "IDENTIDAD",
      motivo:
        "La foto de la cédula está borrosa y no se leen el número ni la fecha de vencimiento. Sube una imagen nítida o un PDF escaneado.",
    },
  },
  {
    id: "demo-cardones",
    tipo: "ORGANIZACION",
    correo: "contacto@cardones.org",
    razonSocial: "Consejo Comunal Los Cardones",
    rif: "C-29876543-7",
    tipoEntidad: "Consejos comunales / Comunas",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
];

export function almacenDemo(): Almacen {
  const alm = crearAlmacen();
  const hash = cifrar(CONTRASENA_DEMO);
  for (const c of cuentas) alm.cuentas.set(c.id, { ...c, hash });
  // Enlaces de ejemplo para ver los estados «vencido» y «ya usado».
  alm.tokens.set("demo-vencido", {
    cuentaId: "demo-luis",
    tipo: "VERIFICAR",
    expira: 0,
    usado: false,
  });
  alm.tokens.set("demo-usado", {
    cuentaId: "demo-ana",
    tipo: "VERIFICAR",
    expira: Number.MAX_SAFE_INTEGER,
    usado: true,
  });
  return alm;
}
