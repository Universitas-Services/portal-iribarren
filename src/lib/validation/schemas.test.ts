import { describe, expect, it } from "vitest";
import { MB } from "./common";
import { participacionSchema, registroNaturalSchema, registroOrganizacionSchema } from "./schemas";

const pdf = (bytes = 1000) =>
  new File([new Uint8Array(bytes)], "plan.pdf", { type: "application/pdf" });

describe("registroNaturalSchema", () => {
  const base = {
    cedula: "V-12345678",
    nombres: "Ana María",
    apellidos: "Pérez Núñez",
    correo: "ana@ejemplo.com",
    contrasena: "Segura#2026",
    confirmarContrasena: "Segura#2026",
    aceptaTerminos: true,
    aceptaPoliticaDatos: true,
  };

  it("acepta un registro válido sin teléfono (se pide en el perfil)", () => {
    expect(registroNaturalSchema.safeParse(base).success).toBe(true);
  });

  it("exige aceptar términos y política de datos", () => {
    expect(registroNaturalSchema.safeParse({ ...base, aceptaTerminos: false }).success).toBe(false);
    expect(registroNaturalSchema.safeParse({ ...base, aceptaPoliticaDatos: false }).success).toBe(
      false,
    );
  });

  it("exige que las contraseñas coincidan", () => {
    const r = registroNaturalSchema.safeParse({ ...base, confirmarContrasena: "Distinta#2026" });
    expect(r.error?.issues[0]?.path).toEqual(["confirmarContrasena"]);
  });

  it("solo admite letras y espacios en los nombres", () => {
    expect(registroNaturalSchema.safeParse({ ...base, nombres: "Ana2" }).success).toBe(false);
  });
});

describe("registroOrganizacionSchema", () => {
  const base = {
    tipoEntidad: "Consejos comunales / Comunas",
    razonSocial: "Consejo Comunal Los Cardones",
    rif: "c298765437",
    correo: "contacto@cardones.org",
    contrasena: "Segura#2026",
    confirmarContrasena: "Segura#2026",
    aceptaTerminos: true,
    aceptaPoliticaDatos: true,
  };

  it("acepta un registro válido y normaliza el RIF", () => {
    const r = registroOrganizacionSchema.safeParse(base);
    expect(r.success).toBe(true);
    expect(r.data?.rif).toBe("C-29876543-7");
  });

  it("rechaza un tipo de entidad fuera de la lista de la v3", () => {
    expect(registroOrganizacionSchema.safeParse({ ...base, tipoEntidad: "Club" }).success).toBe(
      false,
    );
  });
});

describe("participacionSchema", () => {
  const base = {
    tipo: "OPINION_GENERAL",
    parroquia: "Catedral",
    sector: "Centro",
    categoriaTecnica: "Vialidad",
    descripcion: "Propongo mejorar la señalización de la avenida principal del sector.",
    actuaComo: "PERSONA",
    mostrarNombre: false,
  };

  it("acepta una opinión general sin adjunto", () => {
    expect(participacionSchema.safeParse(base).success).toBe(true);
  });

  it("exige adjunto en la propuesta formal", () => {
    const r = participacionSchema.safeParse({ ...base, tipo: "PROPUESTA_FORMAL" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["adjunto"]);
    expect(
      participacionSchema.safeParse({ ...base, tipo: "PROPUESTA_FORMAL", adjunto: pdf() }).success,
    ).toBe(true);
  });

  it("rechaza un adjunto de más de 2 MB", () => {
    const r = participacionSchema.safeParse({
      ...base,
      tipo: "PROPUESTA_FORMAL",
      adjunto: pdf(2 * MB + 1),
    });
    expect(r.success).toBe(false);
  });

  it("exige la noticia en una opinión sobre noticia", () => {
    const r = participacionSchema.safeParse({ ...base, tipo: "OPINION_NOTICIA" });
    expect(r.error?.issues[0]?.path).toEqual(["postId"]);
  });

  it("exige la organización si actúa como organización", () => {
    const r = participacionSchema.safeParse({ ...base, actuaComo: "ORGANIZACION" });
    expect(r.error?.issues[0]?.path).toEqual(["organizationId"]);
  });

  it("rechaza una descripción de menos de 30 caracteres", () => {
    expect(participacionSchema.safeParse({ ...base, descripcion: "Muy corto" }).success).toBe(
      false,
    );
  });
});
