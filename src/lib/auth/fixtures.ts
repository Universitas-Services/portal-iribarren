import { ALCALDIA, cifrar, crearAlmacen, type Almacen, type Cuenta } from "./servicio";

/**
 * Cuentas de demostración para probar cada caso del acceso simulado. Las contraseñas están
 * documentadas en el README; todas son datos de ejemplo.
 */
export const CONTRASENA_DEMO = "Iribarren#2026";

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
    perfilCompleto: true,
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
    perfilCompleto: false,
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
    perfilCompleto: true,
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
    perfilCompleto: false,
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
