import { expect, test } from "@playwright/test";
import { ingresar } from "./utilidades";

/*
 * Adjuntos de un aporte (R19): en la página pública se ven las fotos y el video; el documento de
 * soporte solo lo ve su autor. Sin plataforma-api, los aportes de ejemplo usan fotos libres de la
 * ciudad y PDF de ejemplo.
 */

test("en la página pública se ve la foto en el visor y no el documento", async ({ page }) => {
  await page.goto("/propuestas/IRI-2026-0001");
  const ficha = page.getByRole("region", { name: "El aporte" });
  const foto = ficha.getByRole("img", { name: "Foto 1 del aporte IRI-2026-0001" });
  await expect(foto).toBeVisible();
  await expect(ficha.getByText("Documento de soporte")).toHaveCount(0);
  await expect(ficha.getByText(/croquis-cruce-av20/)).toHaveCount(0);

  await expect(async () => {
    await ficha.getByRole("button", { name: "Ampliar foto 1 de 1" }).click();
    await expect(page.getByRole("dialog", { name: /Visor de fotos/ })).toBeVisible({
      timeout: 2_000,
    });
  }).toPass();
  const visor = page.getByRole("dialog", { name: /Visor de fotos/ });
  await expect(visor).toContainText("Wikimedia Commons");
  await page.keyboard.press("Escape");
  await expect(visor).toBeHidden();
  // Sin desplazamiento horizontal, también en el teléfono.
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test("el autor ve la foto y abre su documento de soporte", async ({ page }) => {
  await ingresar(page, "ana@ejemplo.com");
  await page.goto("/mi-cuenta/participaciones/IRI-2026-0001");
  const ficha = page.getByRole("region", { name: "Lo que enviaste" });
  await expect(ficha.getByRole("img", { name: "Foto 1 del aporte IRI-2026-0001" })).toBeVisible();
  const documento = ficha.getByRole("region", { name: "croquis-cruce-av20.pdf" });
  await expect(documento).toContainText("Documento de soporte");
  await expect(documento.getByRole("link", { name: /Abrir/ })).toHaveAttribute("href", /\.pdf$/);
  await expect(documento.getByRole("link", { name: "Descargar" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});
