import { describe, expect, it } from "vitest";
import { MB } from "./common";
import {
  datosNaturalSchema,
  filtrosParticipacionesSchema,
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
    mostrarNombre: "no",
    idempotencia: "clave-de-prueba-123",
  };

  it("acepta una opinión general sin adjunto", () => {
    expect(participacionSchema.safeParse(base).success).toBe(true);
  });

  it("exige responder Sí o No a mostrar el nombre, sin respuesta por defecto", () => {
    const { mostrarNombre: _, ...sinRespuesta } = base;
    const r = participacionSchema.safeParse(sinRespuesta);
    expect(r.error?.issues[0]).toMatchObject({
      path: ["mostrarNombre"],
      message: "Elige si quieres que aparezca tu nombre.",
    });
    expect(participacionSchema.safeParse({ ...base, mostrarNombre: "on" }).success).toBe(false);
    expect(participacionSchema.parse({ ...base, mostrarNombre: "si" }).mostrarNombre).toBe(true);
    expect(participacionSchema.parse(base).mostrarNombre).toBe(false);
  });

  it("exige adjunto y ubicación en la propuesta formal y acepta PNG", () => {
    const r = participacionSchema.safeParse({ ...base, tipo: "PROPUESTA_FORMAL" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(["soporte", "ubicacion"]);
    const png = new File([new Uint8Array(10)], "plano.png", { type: "image/png" });
    expect(
      participacionSchema.safeParse({
        ...base,
        tipo: "PROPUESTA_FORMAL",
        soporte: png,
        latitud: "10.0678",
        longitud: "-69.3467",
      }).success,
    ).toBe(true);
  });

  it("la ubicación es opcional en una opinión, pero debe estar en Iribarren", () => {
    expect(participacionSchema.safeParse({ ...base, latitud: "", longitud: "" }).success).toBe(
      true,
    );
    const fuera = participacionSchema.safeParse({
      ...base,
      latitud: "10.4806",
      longitud: "-66.9036",
    });
    expect(fuera.success).toBe(false);
    expect(fuera.error?.issues[0]?.path).toEqual(["ubicacion"]);
  });

  it("rechaza un adjunto de más de 2 MB", () => {
    const r = participacionSchema.safeParse({
      ...base,
      tipo: "PROPUESTA_FORMAL",
      soporte: pdf(2 * MB + 1),
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

  const foto = (nombre = "calle.jpg", tipo = "image/jpeg") =>
    new File([new Uint8Array(10)], nombre, { type: tipo });

  it("acepta hasta 5 imágenes JPG, PNG o WebP en cualquier modalidad", () => {
    const imagenes = [foto(), foto("a.png", "image/png"), foto("b.webp", "image/webp")];
    expect(participacionSchema.safeParse({ ...base, imagenes }).success).toBe(true);
    const seis = Array.from({ length: 6 }, () => foto());
    expect(participacionSchema.safeParse({ ...base, imagenes: seis }).success).toBe(false);
    expect(
      participacionSchema.safeParse({ ...base, imagenes: [foto("plano.pdf", "application/pdf")] })
        .success,
    ).toBe(false);
  });

  it("acepta un enlace de YouTube o Instagram y rechaza otros", () => {
    const r = participacionSchema.safeParse({ ...base, video: "https://youtu.be/dQw4w9WgXcQ" });
    expect(r.data?.video).toEqual({
      fuente: "YOUTUBE",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    expect(participacionSchema.safeParse({ ...base, video: "" }).data?.video).toBeUndefined();
    expect(participacionSchema.safeParse({ ...base, video: "https://vimeo.com/1" }).success).toBe(
      false,
    );
  });

  it("las imágenes y el video no reemplazan el soporte de la propuesta formal", () => {
    const r = participacionSchema.safeParse({
      ...base,
      tipo: "PROPUESTA_FORMAL",
      imagenes: [foto()],
      video: "https://youtu.be/dQw4w9WgXcQ",
      latitud: "10.0678",
      longitud: "-69.3467",
    });
    expect(r.error?.issues[0]?.path).toEqual(["soporte"]);
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

describe("filtrosParticipacionesSchema", () => {
  it("lee los valores de la URL y descarta los inválidos", () => {
    const f = filtrosParticipacionesSchema.parse({
      estado: "en-revision",
      tipo: "propuesta-formal",
      parroquia: "El Cují",
      categoriaTecnica: "Inventada",
      folio: "IRI-2026-0004",
      pagina: "x",
    });
    expect(f).toMatchObject({
      estado: "EN_REVISION",
      tipo: "PROPUESTA_FORMAL",
      parroquia: "El Cují",
      categoriaTecnica: undefined,
      folio: "IRI-2026-0004",
      pagina: 1,
    });
    expect(filtrosParticipacionesSchema.parse({ estado: "borrado", folio: "<x>" })).toMatchObject({
      estado: undefined,
      folio: undefined,
    });
  });
});
