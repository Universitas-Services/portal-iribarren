import { describe, expect, it } from "vitest";
import {
  coordenadasDeEnlace,
  dentroDeIribarren,
  enlaceGoogleMaps,
  esEnlaceCorto,
  esEnlaceMaps,
} from "./ubicacion";

describe("coordenadasDeEnlace", () => {
  it("lee el lugar marcado (!3d…!4d…) antes que el centro de la vista", () => {
    expect(
      coordenadasDeEnlace(
        "https://www.google.com/maps/place/Plaza+Ayacucho/@10.0700,-69.3500,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d10.0712345!4d-69.3456789",
      ),
    ).toEqual({ lat: 10.0712345, lng: -69.3456789 });
  });

  it("lee los parámetros q, query y ll", () => {
    expect(coordenadasDeEnlace("https://www.google.com/maps?q=10.0678,-69.3467")).toEqual({
      lat: 10.0678,
      lng: -69.3467,
    });
    expect(
      coordenadasDeEnlace("https://www.google.com/maps/search/?api=1&query=10.05%2C-69.32"),
    ).toEqual({ lat: 10.05, lng: -69.32 });
    expect(coordenadasDeEnlace("https://maps.google.com/?ll=10.1,-69.3")).toEqual({
      lat: 10.1,
      lng: -69.3,
    });
  });

  it("lee las coordenadas de la ruta y el centro de la vista", () => {
    expect(coordenadasDeEnlace("https://www.google.com/maps/place/10.0601,+-69.3290")).toEqual({
      lat: 10.0601,
      lng: -69.329,
    });
    expect(coordenadasDeEnlace("https://www.google.co.ve/maps/@10.0444,-69.3011,15z")).toEqual({
      lat: 10.0444,
      lng: -69.3011,
    });
  });

  it("rechaza enlaces que no son de Google Maps o sin coordenadas", () => {
    expect(coordenadasDeEnlace("https://www.openstreetmap.org/#map=15/10.06/-69.34")).toBeNull();
    expect(coordenadasDeEnlace("https://www.google.com/search?q=10.06,-69.34")).toBeNull();
    expect(coordenadasDeEnlace("https://www.google.com/maps/place/Barquisimeto")).toBeNull();
    expect(coordenadasDeEnlace("no es un enlace")).toBeNull();
  });
});

describe("enlaces cortos y límites", () => {
  it("reconoce los enlaces cortos que se resuelven en el servidor", () => {
    const corto = esEnlaceMaps("https://maps.app.goo.gl/AbCdEf123")!;
    expect(esEnlaceCorto(corto)).toBe(true);
    expect(esEnlaceMaps("https://goo.gl/otra-cosa")).toBeNull();
    expect(esEnlaceMaps("https://evil.example.com/maps?q=10,-69")).toBeNull();
  });

  it("acepta puntos de Iribarren y descarta los de fuera", () => {
    expect(dentroDeIribarren({ lat: 10.0678, lng: -69.3467 })).toBe(true);
    expect(dentroDeIribarren({ lat: 10.4806, lng: -66.9036 })).toBe(false); // Caracas
  });

  it("arma el enlace de Google Maps desde las coordenadas", () => {
    expect(enlaceGoogleMaps({ lat: 10.0678, lng: -69.3467 })).toBe(
      "https://www.google.com/maps?q=10.067800,-69.346700",
    );
  });
});
