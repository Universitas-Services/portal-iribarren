import { describe, expect, it } from "vitest";
import { MB } from "./common";
import { participacionSchema, registroSchema } from "./schemas";

const pdf = (bytes = 1000) =>
  new File([new Uint8Array(bytes)], "plan.pdf", { type: "application/pdf" });

describe("registroSchema", () => {
  const base = {
    tipoPerfil: "NATURAL",
    cedula: "V-12345678",
    nombres: "Ana",
    apellidos: "Pérez",
    correo: "ana@ejemplo.com",
    telefono: "0414-1234567",
    contrasena: "Segura#2026",
    confirmarContrasena: "Segura#2026",
    aceptaTerminos: true,
    aceptaPoliticaDatos: true,
  };

  it("acepta un registro válido", () => {
    expect(registroSchema.safeParse(base).success).toBe(true);
  });

  it("exige aceptar términos y política de datos", () => {
    expect(registroSchema.safeParse({ ...base, aceptaTerminos: false }).success).toBe(false);
    expect(registroSchema.safeParse({ ...base, aceptaPoliticaDatos: false }).success).toBe(false);
  });

  it("exige que las contraseñas coincidan", () => {
    const r = registroSchema.safeParse({ ...base, confirmarContrasena: "Distinta#2026" });
    expect(r.error?.issues[0]?.path).toEqual(["confirmarContrasena"]);
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
