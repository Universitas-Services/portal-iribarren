import { describe, expect, it } from "vitest";
import { MB } from "./common";
import {
  datosNaturalSchema,
  documentoPerfilSchema,
  participacionSchema,
  registroNaturalSchema,
  registroOrganizacionSchema,
  representanteSchema,
} from "./schemas";

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
    sector: "Centro histórico",
    categoriaTecnica: "Vialidad y Transporte",
    descripcion:
      "Propongo mejorar la señalización y los pasos peatonales de la avenida principal del sector.",
    mostrarNombre: false,
    idempotencia: "clave-de-prueba-123",
  };

  it("acepta una opinión general sin adjunto", () => {
    expect(participacionSchema.safeParse(base).success).toBe(true);
  });

  it("exige adjunto en la propuesta formal y acepta PNG", () => {
    const r = participacionSchema.safeParse({ ...base, tipo: "PROPUESTA_FORMAL" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["adjunto"]);
    const png = new File([new Uint8Array(10)], "plano.png", { type: "image/png" });
    expect(
      participacionSchema.safeParse({ ...base, tipo: "PROPUESTA_FORMAL", adjunto: png }).success,
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
    expect(r.error?.issues[0]?.path).toEqual(["noticia"]);
  });

  it("solo admite parroquias y categorías del catálogo", () => {
    expect(participacionSchema.safeParse({ ...base, parroquia: "Cabudare" }).success).toBe(false);
    expect(participacionSchema.safeParse({ ...base, categoriaTecnica: "Vialidad" }).success).toBe(
      false,
    );
  });

  it("pide entre 50 y 3000 caracteres en la descripción", () => {
    expect(participacionSchema.safeParse({ ...base, descripcion: "a".repeat(49) }).success).toBe(
      false,
    );
    expect(participacionSchema.safeParse({ ...base, descripcion: "a".repeat(3001) }).success).toBe(
      false,
    );
  });

  it("limita el sector a 150 caracteres", () => {
    expect(participacionSchema.safeParse({ ...base, sector: "a".repeat(151) }).success).toBe(false);
  });
});

describe("perfil", () => {
  it("datos de persona natural: teléfono obligatorio y ocupación opcional del catálogo", () => {
    expect(datosNaturalSchema.safeParse({ telefono: "0414-1234567", ocupacion: "" }).success).toBe(
      true,
    );
    expect(
      datosNaturalSchema.safeParse({ telefono: "0414-1234567", ocupacion: "Astronauta" }).success,
    ).toBe(false);
    expect(datosNaturalSchema.safeParse({ telefono: "" }).success).toBe(false);
  });

  it("representante: condición del catálogo, nombre sin números y cédula válida", () => {
    const rep = {
      condicion: "Vocero o vocera oficial",
      nombresRepresentante: "José",
      apellidosRepresentante: "Colmenárez",
      cedulaRepresentante: "v11222333",
      telefonoInstitucional: "0251-2345678",
    };
    const r = representanteSchema.safeParse(rep);
    expect(r.data?.cedulaRepresentante).toBe("V-11222333");
    expect(representanteSchema.safeParse({ ...rep, nombresRepresentante: "J0sé" }).success).toBe(
      false,
    );
  });

  it("documento del perfil: PDF, JPG o PNG de hasta 2 MB", () => {
    expect(
      documentoPerfilSchema.safeParse({ documento: "IDENTIDAD", archivo: pdf() }).success,
    ).toBe(true);
    const docx = new File([new Uint8Array(10)], "cedula.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    expect(documentoPerfilSchema.safeParse({ documento: "IDENTIDAD", archivo: docx }).success).toBe(
      false,
    );
  });
});
