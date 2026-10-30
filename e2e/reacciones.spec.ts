import { expect, test, type Page } from "@playwright/test";
import { ingresar } from "./utilidades";

/*
 * Vistas y reacciones en el detalle de una noticia (guía R12, aquí en modo simulado): la vista
 * se cuenta al abrir, reaccionar pide la cuenta, y pulsar la misma reacción la quita.
 */

/** La primera noticia del listado (las de ejemplo cambian con los datos simulados). */
async function abrirNoticia(page: Page) {
  await page.goto("/noticias");
  const enlace = page.locator('main a[href^="/noticias/"]').first();
  const href = await enlace.getAttribute("href");
  await page.goto(href!);
}

test("sin sesión, reaccionar pide la cuenta", async ({ page }) => {
  await abrirNoticia(page);
  const bloque = page.getByRole("region", { name: "Reacciones a esta noticia" });
  await expect(bloque.getByText(/\d+ vistas?/)).toBeVisible();
  await bloque.getByRole("button", { name: /Me gusta/ }).click();
  await expect(bloque.getByText("Para reaccionar necesitas tu cuenta.")).toBeVisible();
  await expect(bloque.getByRole("button", { name: /Me gusta/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("con sesión, la misma reacción se pone y se quita", async ({ page }) => {
  await ingresar(page, "ana@ejemplo.com");
  await abrirNoticia(page);
  const bloque = page.getByRole("region", { name: "Reacciones a esta noticia" });
  const megusta = bloque.getByRole("button", { name: /Me gusta/ });
  await expect(megusta).toBeEnabled();
  const antes = await megusta.getAttribute("aria-pressed");
  await megusta.click();
  await expect(megusta).toHaveAttribute("aria-pressed", antes === "true" ? "false" : "true");
  await expect(megusta).toBeEnabled();
  // Se deja como estaba: el almacén es uno para todas las pruebas.
  await megusta.click();
  await expect(megusta).toHaveAttribute("aria-pressed", antes ?? "false");
});
