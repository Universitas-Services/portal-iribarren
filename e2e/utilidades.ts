import { expect, type Page } from "@playwright/test";

/** PNG de 1 × 1 px: basta para la validación de tipo y peso del cliente y del servidor. */
export const PNG = {
  name: "cedula.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
};

export const PDF = {
  name: "propuesta-soporte.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"),
};

/** Contraseña de las cuentas de demostración (fixtures.ts). */
export const CONTRASENA_DEMO = "Iribarren#2026";

/** Datos únicos por prueba: el almacén simulado vive mientras corre `next dev`. */
export function ciudadanoNuevo() {
  const n = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    // V con 8 dígitos sin cero inicial.
    cedula: `1${n.slice(-7)}`,
    correo: `e2e.${n}@ejemplo.com`,
    contrasena: "Prueba#E2e2026",
  };
}

/** Elige una opción del selector propio (combobox ARIA; en el teléfono abre una hoja inferior). */
export async function elegir(page: Page, etiqueta: RegExp, opcion: string) {
  await page.getByRole("combobox", { name: etiqueta }).click();
  await page.getByRole("option", { name: opcion, exact: true }).click();
  await expect(page.getByRole("combobox", { name: etiqueta })).toContainText(opcion);
}

export async function ingresar(page: Page, correo: string, contrasena = CONTRASENA_DEMO) {
  await page.goto("/ingresar");
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.locator("#contrasena").fill(contrasena);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL((url) => url.pathname !== "/ingresar");
}

/**
 * Una cuenta nueva ve el recorrido guiado al entrar por primera vez: se salta, y así queda
 * marcado como visto (no vuelve a abrirse).
 */
export async function saltarRecorrido(page: Page) {
  const recorrido = page.getByRole("dialog").filter({ hasText: /Paso 1 de/ });
  await expect(recorrido).toContainText("Te damos la bienvenida", { timeout: 15_000 });
  await recorrido.getByRole("button", { name: "Saltar el recorrido" }).click();
  await expect(recorrido).toHaveCount(0);
  // Marcarlo como visto renueva la sesión y la página: se espera a que termine.
  await page.waitForLoadState("networkidle");
}
