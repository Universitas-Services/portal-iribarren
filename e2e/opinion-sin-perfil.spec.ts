import { expect, test } from "@playwright/test";
import { elegir, ingresar } from "./utilidades";

/*
 * Solo la propuesta formal pide el perfil completo y los documentos (R18). José tiene el perfil
 * vacío: opina, pero la opción de la propuesta formal queda deshabilitada.
 */

test("con el perfil incompleto se opina; la propuesta formal queda deshabilitada", async ({
  page,
}) => {
  test.slow();
  await ingresar(page, "jose@ejemplo.com");
  await expect(page).toHaveURL(/\/participa$/);

  const enviar = page.getByRole("button", { name: "Revisar y enviar" });
  await expect(enviar).toBeEnabled();
  await expect(page.getByRole("radio", { name: "Propuesta formal" })).toBeDisabled();
  await expect(page.getByText(/Requiere el perfil completo y la verificación/)).toBeVisible();

  // Si llega pidiendo la propuesta, abre en opinión y explica qué falta.
  await page.goto("/participa?tipo=propuesta");
  await expect(page.getByText(/primero completa tu perfil y la verificación/)).toBeVisible();
  await expect(page.getByText("Teléfono de contacto", { exact: true })).toBeVisible();
  await expect(page.getByText("Documento de identidad", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Opinión general" })).toBeChecked();
  await elegir(page, /^Parroquia/, "Catedral");
  await page.getByLabel(/Comunidad, barrio o sector/).fill("Centro histórico");
  await elegir(page, /área del plan/, "Vialidad y Transporte");
  await page
    .getByLabel("Tu opinión")
    .fill(
      "Opinión de prueba automatizada: hacen falta más pasos peatonales señalizados en el centro de la ciudad.",
    );
  await page.getByRole("radio", { name: /^No, como/ }).check();
  await enviar.click();

  const dialogo = page.getByRole("dialog", { name: "Confirma tu envío" });
  await expect(dialogo).toContainText("Ciudadano de Iribarren");
  await dialogo.getByRole("button", { name: "Confirmar envío" }).click();
  await expect(page).toHaveURL(/\/participa\/enviada\?folio=IRI-\d{4}-\d{4}/);
});
