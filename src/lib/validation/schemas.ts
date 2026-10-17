import { z } from "zod";
import {
  ACREDITACION_REPRESENTANTE,
  CATEGORIAS,
  CATEGORIAS_TECNICAS,
  CONDICIONES_REPRESENTANTE,
  DOC_CATEGORIAS,
  OCUPACIONES,
  PARROQUIAS,
  ESTADOS_PARTICIPACION,
  TIPOS_PARTICIPACION,
  type DocEstado,
  type FiltrosDocumentos,
  type FiltrosNoticias,
  type PostFormat,
} from "@/lib/api/types";
import { enlaceVideo } from "@/lib/noticias/video";
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

/* ---------- Perfil (v3, «Para terminación del perfil») ---------- */

const opcion = <T extends readonly [string, ...string[]]>(valores: T, error: string) =>
  z.enum(valores, { error });

/** Persona natural, paso 1: teléfono de contacto y ocupación (opcional). */
export const datosNaturalSchema = z.object({
  telefono: telefonoSchema,
  ocupacion: z.preprocess(
    (v) => (v === "" ? undefined : v),
    opcion(OCUPACIONES, "Elige una ocupación de la lista.").optional(),
  ),
});

/** Organización, paso 1: quién la representa y el teléfono institucional. */
export const representanteSchema = z.object({
  condicion: opcion(CONDICIONES_REPRESENTANTE, "Indica en qué condición actúas."),
  nombresRepresentante: nombrePersonaSchema,
  apellidosRepresentante: nombrePersonaSchema,
  cedulaRepresentante: cedulaSchema,
  telefonoInstitucional: telefonoSchema,
});

/** Organización, paso 2: ¿tiene documento que acredite su condición? (el archivo, si es «Sí»). */
export const acreditacionSchema = z.object({
  acreditacion: opcion(ACREDITACION_REPRESENTANTE, "Responde si tienes el documento."),
});

/** Documentos del perfil: PDF, JPG o PNG de hasta 2 MB (v3, RN-09). */
export const TIPOS_DOCUMENTO_PERFIL = ["IDENTIDAD", "REPRESENTACION", "ENTIDAD"] as const;
export type TipoDocumentoPerfil = (typeof TIPOS_DOCUMENTO_PERFIL)[number];

export const documentoPerfilSchema = z.object({
  documento: z.enum(TIPOS_DOCUMENTO_PERFIL),
  archivo: archivoSchema(),
});

/* ---------- Participación (v3, formulario 3) ---------- */

export const DESCRIPCION_MIN = 50;
export const DESCRIPCION_MAX = 3000;
export const MAX_IMAGENES = 5;
export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"] as const;

/** Imagen de apoyo: JPG, PNG o WebP de hasta 2 MB. */
export const imagenSchema = archivoSchema({ tipos: TIPOS_IMAGEN });

/** Enlace de video: solo YouTube o una publicación de Instagram (no se suben archivos de video). */
export const videoSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const e = enlaceVideo(v);
    if (!e) {
      ctx.addIssue({
        code: "custom",
        message: "Pega un enlace de YouTube o de una publicación de Instagram.",
      });
      return z.NEVER;
    }
    return e;
  });

/** CU-19 Enviar participación. La cuenta participa a su nombre (persona u organización). */
export const participacionSchema = z
  .object({
    tipo: z.enum(TIPOS_PARTICIPACION, { error: "Elige el tipo de participación." }),
    noticia: z.string().trim().optional(),
    parroquia: opcion(PARROQUIAS, "Selecciona la parroquia."),
    sector: z
      .string()
      .trim()
      .min(3, "Indica la comunidad, barrio, urbanización o sector.")
      .max(150, "El sector no puede superar 150 caracteres."),
    categoriaTecnica: opcion(CATEGORIAS_TECNICAS, "Selecciona la categoría técnica."),
    descripcion: z
      .string()
      .trim()
      .min(DESCRIPCION_MIN, `Explica tu aporte con al menos ${DESCRIPCION_MIN} caracteres.`)
      .max(DESCRIPCION_MAX, `La descripción no puede superar ${DESCRIPCION_MAX} caracteres.`),
    /** Fotos del lugar o de la situación (todas las modalidades). */
    imagenes: z
      .array(imagenSchema)
      .max(MAX_IMAGENES, `Puedes adjuntar hasta ${MAX_IMAGENES} imágenes.`)
      .default([]),
    video: z.preprocess((v) => (v === "" ? undefined : v), videoSchema.optional()),
    /** Documento de soporte: obligatorio en la propuesta formal. */
    soporte: archivoSchema().optional(),
    mostrarNombre: z.boolean(),
    idempotencia: z.string().min(8),
  })
  .superRefine((d, ctx) => {
    if (d.tipo === "OPINION_NOTICIA" && !d.noticia) {
      ctx.addIssue({ code: "custom", path: ["noticia"], message: "Selecciona la noticia." });
    }
    if (d.tipo === "PROPUESTA_FORMAL" && !d.soporte) {
      ctx.addIssue({
        code: "custom",
        path: ["soporte"],
        message: "La propuesta formal necesita un documento de soporte (PDF, JPG o PNG).",
      });
    }
  });

export type RegistroNaturalInput = z.infer<typeof registroNaturalSchema>;
export type RegistroOrganizacionInput = z.infer<typeof registroOrganizacionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
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

/* ---------- Filtros de participaciones (Mis participaciones y galería pública) ---------- */

/** En la URL los valores van en minúsculas y con guion: EN_REVISION → en-revision. */
export const aSlug = (v: string) => v.toLowerCase().replace(/_/g, "-");
const desdeSlug = <T extends readonly string[]>(valores: T) =>
  z
    .string()
    .transform((s) => valores.find((v) => aSlug(v) === s))
    .pipe(z.enum(valores as unknown as [T[number], ...T[number][]]).optional());

/** Nunca lanza: un valor inválido se descarta, como en los demás listados. */
export const filtrosParticipacionesSchema = z.object({
  estado: z.preprocess(primero, desdeSlug(ESTADOS_PARTICIPACION).optional()).catch(undefined),
  tipo: z.preprocess(primero, desdeSlug(TIPOS_PARTICIPACION).optional()).catch(undefined),
  parroquia: z.preprocess(primero, z.enum(PARROQUIAS).optional()).catch(undefined),
  categoriaTecnica: z.preprocess(primero, z.enum(CATEGORIAS_TECNICAS).optional()).catch(undefined),
  folio: z
    .preprocess(
      primero,
      z
        .string()
        .trim()
        .max(20)
        .regex(/^[\w-]*$/)
        .optional(),
    )
    .catch(undefined),
  q: z.preprocess(primero, z.string().trim().max(100).optional()).catch(undefined),
  pagina: z.preprocess(primero, z.coerce.number().int().min(1).max(10_000)).catch(1),
});

export type FiltrosParticipaciones = z.infer<typeof filtrosParticipacionesSchema>;
