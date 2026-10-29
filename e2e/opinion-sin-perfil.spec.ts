import { expect, test } from "@playwright/test";
import { elegir, ingresar } from "./utilidades";

/*
 * Solo la propuesta formal exige el perfil completo (decisión del cliente, 28-10-2026). José tiene
 * el perfil vacío: opina, pero la propuesta formal queda bloqueada con lo que le falta.
 */

test("con el perfil incompleto se opina; la propuesta formal pide completar el perfil", async ({
  page,
}) => {
  test.slow();
  await ingresar(page, "jose@ejemplo.com");
  await page.goto("/participa");

  const enviar = page.getByRole("button", { name: "Revisar y enviar" });
  await expect(enviar).toBeEnabled();
  await expect(page.getByText(/primero completa tu perfil/)).toHaveCount(0);

  await page.getByRole("radio", { name: "Propuesta formal" }).check();
  await expect(
    page.getByText("Para enviar una propuesta formal, primero completa tu perfil."),
  ).toBeVisible();
  await expect(enviar).toBeDisabled();

  await page.getByRole("radio", { name: "Opinión general" }).check();
  await expect(enviar).toBeEnabled();
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
