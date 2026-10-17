import { z } from "zod";
import {
  CATEGORIAS,
  DOC_CATEGORIAS,
  type DocEstado,
  type FiltrosDocumentos,
  type FiltrosNoticias,
  type PostFormat,
} from "@/lib/api/types";
import {
  aceptacionSchema,
  archivoSchema,
  cedulaSchema,
  contrasenaSchema,
  correoSchema,
  nombrePersonaSchema,
  rifSchema,
  telefonoSchema,
} from "./common";

export const TIPOS_PERFIL = ["NATURAL", "ORGANIZACION"] as const;

/** Tipos de entidad de la Propuesta de Gestión Ciudadana v3. */
export const TIPOS_ENTIDAD = [
  "Cámaras empresariales",
  "Colegios profesionales / Gremios",
  "Universidades / Centros de investigación",
  "Consejos comunales / Comunas",
  "Comités de Tierras Urbanas (CTU)",
  "Asociaciones civiles / ONG / Fundaciones",
  "Empresas / Promotores inmobiliarios",
  "Otros",
] as const;

const credenciales = {
  contrasena: contrasenaSchema,
  confirmarContrasena: z.string(),
  aceptaTerminos: aceptacionSchema,
  aceptaPoliticaDatos: aceptacionSchema,
};

const contrasenasIguales = {
  check: (d: { contrasena: string; confirmarContrasena: string }) =>
    d.contrasena === d.confirmarContrasena,
  params: { path: ["confirmarContrasena"], error: "Las contraseñas no coinciden." },
};

/**
 * CU-16 Registro de persona natural (v3, «Para registro»). El teléfono y la ocupación se
 * piden al completar el perfil.
 */
export const registroNaturalSchema = z
  .object({
    cedula: cedulaSchema,
    nombres: nombrePersonaSchema,
    apellidos: nombrePersonaSchema,
    correo: correoSchema,
    ...credenciales,
  })
  .refine(contrasenasIguales.check, contrasenasIguales.params);

/**
 * CU-16 Registro de organización (v3). La cuenta se crea con el correo institucional; los
 * datos del representante (nombre, cédula y acreditación) se piden al completar el perfil.
 */
export const registroOrganizacionSchema = z
  .object({
    tipoEntidad: z.enum(TIPOS_ENTIDAD, { error: "Selecciona el tipo de entidad." }),
    razonSocial: z
      .string()
      .trim()
      .min(3, "Ingresa la razón social o denominación oficial.")
      .max(255, "No puede superar 255 caracteres."),
    rif: rifSchema,
    correo: correoSchema,
    ...credenciales,
  })
  .refine(contrasenasIguales.check, contrasenasIguales.params);

/** CU-01 Iniciar sesión. */
export const loginSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(1, "Ingresa tu contraseña."),
});

/** Olvidé mi contraseña: la respuesta es neutra exista o no la cuenta. */
export const recuperarSchema = z.object({ correo: correoSchema });

/** Restablecer contraseña desde el enlace del correo. */
export const restablecerSchema = z
  .object({
    token: z.string().min(1, "El enlace no es válido."),
    contrasena: contrasenaSchema,
    confirmarContrasena: z.string(),
  })
  .refine(contrasenasIguales.check, contrasenasIguales.params);

/** CU-18 Completar perfil: datos personales y documento de identidad. */
export const perfilSchema = z.object({
  telefono: telefonoSchema,
  ocupacion: z.string().trim().optional(),
});

export const documentoIdentidadSchema = z.object({
  archivo: archivoSchema(),
});

/** CU-18 Registrar organización (vocero). */
export const organizacionSchema = z.object({
  tipoEntidad: z.string().trim().min(1, "Selecciona el tipo de organización."),
  razonSocial: z.string().trim().min(3, "Ingresa la razón social.").max(160),
  rif: rifSchema,
  correoInstitucional: correoSchema,
  telefonoInstitucional: telefonoSchema,
  acreditacion: archivoSchema({ tipos: ["application/pdf", "image/jpeg"] }),
});

export const TIPOS_PARTICIPACION = [
  "OPINION_GENERAL",
  "OPINION_NOTICIA",
  "PROPUESTA_FORMAL",
] as const;

/** CU-19 Enviar participación (RN-05, RN-08, RN-09). */
export const participacionSchema = z
  .object({
    tipo: z.enum(TIPOS_PARTICIPACION, { error: "Elige el tipo de participación." }),
    postId: z.string().optional(),
    parroquia: z.string().min(1, "Selecciona la parroquia."),
    sector: z.string().trim().min(2, "Indica el barrio, urbanización o zona.").max(120),
    categoriaTecnica: z.string().min(1, "Selecciona la categoría."),
    descripcion: z
      .string()
      .trim()
      .min(30, "Describe tu aporte con al menos 30 caracteres.")
      .max(5000, "La descripción no puede superar 5.000 caracteres."),
    adjunto: archivoSchema({ tipos: ["application/pdf", "image/jpeg"] }).optional(),
    actuaComo: z.enum(["PERSONA", "ORGANIZACION"]),
    organizationId: z.string().optional(),
    mostrarNombre: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.tipo === "OPINION_NOTICIA" && !d.postId) {
      ctx.addIssue({ code: "custom", path: ["postId"], message: "Selecciona la noticia." });
    }
    if (d.tipo === "PROPUESTA_FORMAL" && !d.adjunto) {
      ctx.addIssue({
        code: "custom",
        path: ["adjunto"],
        message: "La propuesta formal requiere un PDF o JPG de soporte.",
      });
    }
    if (d.actuaComo === "ORGANIZACION" && !d.organizationId) {
      ctx.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "Selecciona la organización.",
      });
    }
  });

export type RegistroNaturalInput = z.infer<typeof registroNaturalSchema>;
export type RegistroOrganizacionInput = z.infer<typeof registroOrganizacionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PerfilInput = z.infer<typeof perfilSchema>;
export type OrganizacionInput = z.infer<typeof organizacionSchema>;
export type ParticipacionInput = z.infer<typeof participacionSchema>;

/** Toma el primer valor cuando el parámetro llega repetido (?a=1&a=2). */
const primero = (v: unknown) => (Array.isArray(v) ? v[0] : v);

const fechaIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) &&
      new Date(`${v}T00:00:00Z`).toISOString().startsWith(v),
  );

/** En la URL el formato va en minúsculas y sin tilde: ?formato=galeria */
export const FORMATO_EN_URL = {
  texto: "TEXTO",
  imagen: "IMAGEN",
  galeria: "GALERIA",
  documento: "DOCUMENTO",
  video: "VIDEO",
} as const satisfies Record<string, PostFormat>;

export const formatoAUrl = (f: PostFormat) =>
  Object.entries(FORMATO_EN_URL).find(([, v]) => v === f)![0];

/**
 * Filtros del listado de noticias leídos de la URL. Nunca lanza error: un valor inválido
 * se descarta para que un enlace mal copiado muestre resultados en lugar de fallar.
 */
export const filtrosNoticiasSchema = z
  .object({
    q: z.preprocess(primero, z.string().trim().max(100).optional()).catch(undefined),
    categoria: z.preprocess(primero, z.enum(CATEGORIAS).optional()).catch(undefined),
    formato: z
      .preprocess(
        primero,
        z
          .enum(Object.keys(FORMATO_EN_URL) as [keyof typeof FORMATO_EN_URL])
          .transform((f) => FORMATO_EN_URL[f])
          .optional(),
      )
      .catch(undefined),
    desde: z.preprocess(primero, fechaIso.optional()).catch(undefined),
    hasta: z.preprocess(primero, fechaIso.optional()).catch(undefined),
    pagina: z.preprocess(primero, z.coerce.number().int().min(1).max(10_000)).catch(1),
  })
  .transform(({ q, categoria, formato, desde, hasta, pagina }): FiltrosNoticias => {
    // Si el rango llega al revés, se invierte en lugar de devolver cero resultados.
    const [d, h] = desde && hasta && desde > hasta ? [hasta, desde] : [desde, hasta];
    return { q: q || undefined, categoria, formato, desde: d, hasta: h, pagina };
  });

export function parseFiltrosNoticias(params: Record<string, string | string[] | undefined>) {
  return filtrosNoticiasSchema.parse(params);
}

/** En la URL el estado va en minúsculas: ?estado=oficial | ?estado=borrador */
export const ESTADO_DOC_EN_URL = {
  oficial: "OFICIAL",
  borrador: "BORRADOR",
} as const satisfies Record<string, DocEstado>;

export const estadoDocAUrl = (e: DocEstado) => (e === "OFICIAL" ? "oficial" : "borrador");

/** Filtros del repositorio documental leídos de la URL; como en noticias, nunca lanza error. */
export const filtrosDocumentosSchema = z.object({
  q: z
    .preprocess(primero, z.string().trim().max(100).optional())
    .transform((q) => q || undefined)
    .catch(undefined),
  categoria: z.preprocess(primero, z.enum(DOC_CATEGORIAS).optional()).catch(undefined),
  estado: z
    .preprocess(
      primero,
      z
        .enum(Object.keys(ESTADO_DOC_EN_URL) as [keyof typeof ESTADO_DOC_EN_URL])
        .transform((e) => ESTADO_DOC_EN_URL[e])
        .optional(),
    )
    .catch(undefined),
  pagina: z.preprocess(primero, z.coerce.number().int().min(1).max(10_000)).catch(1),
}) satisfies z.ZodType<FiltrosDocumentos>;

export function parseFiltrosDocumentos(
  params: Record<string, string | string[] | undefined>,
): FiltrosDocumentos {
  return filtrosDocumentosSchema.parse(params);
}
