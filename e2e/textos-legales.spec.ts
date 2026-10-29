import { expect, test, type Page } from "@playwright/test";
import { ciudadanoNuevo, ingresar, saltarRecorrido } from "./utilidades";

/*
 * Términos de uso y política de datos (R15): se leen en un modal durante el registro, y una
 * versión nueva bloquea la cuenta hasta aceptarla. Cada prueba usa una cuenta nueva: la ruta de
 * desarrollo deja solo esa cuenta con una versión anterior, sin tocar a las demás pruebas.
 */

async function cuentaNueva(page: Page) {
  const c = ciudadanoNuevo();
  await page.goto("/registro?tipo=natural");
  await page.locator("#cedulaNumero").fill(c.cedula);
  await page.getByLabel("Nombres").fill("Prueba");
  await page.getByLabel("Apellidos").fill("Textos");
  await page.getByLabel("Correo electrónico").fill(c.correo);
  await page.locator("#contrasena").fill(c.contrasena);
  await page.locator("#confirmarContrasena").fill(c.contrasena);
  await page.getByLabel(/Acepto los/).check();
  await page.getByLabel(/Acepto la/).check();
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await page.getByRole("link", { name: "Abrir el enlace" }).click();
  await expect(page.getByRole("heading", { name: /correo está verificado/ })).toBeVisible();
  await ingresar(page, c.correo, c.contrasena);
  await saltarRecorrido(page);
  return c;
}

/** Simula que se publicó una versión nueva de los términos que esta cuenta no aceptó. */
async function versionNueva(page: Page, correo: string) {
  const r = await page.request.post("/api/desarrollo/textos-legales", {
    data: { tipo: "TERMINOS", correo },
  });
  expect(r.status()).toBe(200);
}

test("en el registro, los textos se leen en un modal sin marcar la casilla", async ({ page }) => {
  await page.goto("/registro?tipo=natural");
  await page.getByRole("button", { name: "términos de uso" }).click();
  const modal = page.getByRole("dialog", { name: "Términos de uso" });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText(/Versión .+ · publicada el/);
  await expect(page.getByLabel(/Acepto los/)).not.toBeChecked();
  await modal.getByRole("button", { name: "Entendido" }).click();
  await expect(modal).toBeHidden();

  await page.getByRole("button", { name: "política de tratamiento de datos personales" }).click();
  const politica = page.getByRole("dialog", { name: /Política de tratamiento/ });
  await expect(politica).toBeVisible();
  // Este modal sí se cierra con Escape.
  await page.keyboard.press("Escape");
  await expect(politica).toBeHidden();
  await expect(page.getByLabel(/Acepto la/)).not.toBeChecked();
});

test("una versión nueva bloquea la cuenta hasta aceptarla", async ({ page }) => {
  test.slow();
  const c = await cuentaNueva(page);
  await versionNueva(page, c.correo);
  await page.goto("/mi-cuenta");

  const modal = page.getByRole("dialog", { name: "Actualizamos los términos de uso" });
  await expect(modal).toBeVisible();
  // No se cierra con Escape.
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();

  const aceptar = modal.getByRole("button", { name: "Aceptar y continuar" });
  await expect(aceptar).toBeDisabled();
  await modal.getByLabel(/Leí y acepto/).check();
  await aceptar.click();
  await expect(modal).toBeHidden();

  await page.reload();
  await expect(page.getByRole("heading", { name: /Hola, Prueba/ })).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Actualizamos/ })).toHaveCount(0);
});

test("quien no acepta puede cerrar la sesión", async ({ page }) => {
  test.slow();
  const c = await cuentaNueva(page);
  await versionNueva(page, c.correo);
  await page.goto("/mi-cuenta");
  const modal = page.getByRole("dialog", { name: "Actualizamos los términos de uso" });
  await modal.getByRole("button", { name: "No acepto, cerrar sesión" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  await expect(page.getByRole("dialog", { name: /Actualizamos/ })).toHaveCount(0);
  // Ya sin sesión: la cuenta pide ingresar.
  await page.goto("/mi-cuenta");
  await expect(page).toHaveURL(/\/ingresar\?volver=/);
});
