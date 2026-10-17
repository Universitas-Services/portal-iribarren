import { describe, expect, it } from "vitest";
import { duracionLegible, formatearDuracion } from "@/lib/formato";
import { idYoutube } from "./video";

describe("idYoutube", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?t=10",
    "https://m.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  ])("reconoce %s", (url) => {
    expect(idYoutube(url)).toBe("dQw4w9WgXcQ");
  });

  it.each([
    "https://vimeo.com/123456",
    "https://www.youtube.com/watch?v=corto",
    "https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "no es una url",
  ])("rechaza %s", (url) => {
    expect(idYoutube(url)).toBeUndefined();
  });
});

describe("duración", () => {
  it("formatea minutos y horas", () => {
    expect(formatearDuracion(84)).toBe("1:24");
    expect(formatearDuracion(5)).toBe("0:05");
    expect(formatearDuracion(3725)).toBe("1:02:05");
  });

  it("la lee en palabras para lectores de pantalla", () => {
    expect(duracionLegible(84)).toBe("1 minuto y 24 segundos");
    expect(duracionLegible(60)).toBe("1 minuto");
  });
});
