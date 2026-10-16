import { z } from "zod";
import {
  aceptacionSchema,
  archivoSchema,
  cedulaSchema,
  contrasenaSchema,
  correoSchema,
  nombreSchema,
  rifSchema,
  telefonoSchema,
} from "./common";

export const TIPOS_PERFIL = ["NATURAL", "ORGANIZACION"] as const;

/** CU-16 Registrarse en el portal. */
export const registroSchema = z
  .object({
    tipoPerfil: z.enum(TIPOS_PERFIL, { error: "Elige cómo vas a participar." }),
    cedula: cedulaSchema,
    nombres: nombreSchema,
    apellidos: nombreSchema,
    correo: correoSchema,
    telefono: telefonoSchema,
    contrasena: contrasenaSchema,
    confirmarContrasena: z.string(),
    aceptaTerminos: aceptacionSchema,
    aceptaPoliticaDatos: aceptacionSchema,
  })
  .refine((d) => d.contrasena === d.confirmarContrasena, {
    path: ["confirmarContrasena"],
    error: "Las contraseñas no coinciden.",
  });

/** CU-01 Iniciar sesión. */
export const loginSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(1, "Ingresa tu contraseña."),
});

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

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PerfilInput = z.infer<typeof perfilSchema>;
export type OrganizacionInput = z.infer<typeof organizacionSchema>;
export type ParticipacionInput = z.infer<typeof participacionSchema>;
