import { expect, test, type Page } from "@playwright/test";

/*
 * Modo oscuro: el selector (escritorio y menú móvil) guarda la preferencia en el navegador y el
 * tema queda puesto desde el HTML inicial, sin parpadeo. «Según el sistema» sigue al dispositivo.
 */

const tema = (page: Page) => page.evaluate(() => document.documentElement.dataset.tema);

test("por defecto claro; Oscuro se guarda y se mantiene al recargar", async ({ page }, info) => {
  await page.goto("/");
  expect(await tema(page)).toBe("claro");

  if (info.project.name === "movil") {
    await expect(async () => {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      await expect(page.getByRole("group", { name: "Tema" })).toBeVisible({ timeout: 2_000 });
    }).toPass();
    // El radio va oculto a la vista: se toca su opción, como lo haría la persona.
    await page.getByRole("group", { name: "Tema" }).locator("label", { hasText: "Oscuro" }).click();
    await expect(page.getByRole("radio", { name: "Oscuro" })).toBeChecked();
  } else {
    await expect(async () => {
      await page.getByRole("button", { name: /Cambiar tema/ }).click();
      await expect(page.getByRole("menu", { name: "Tema" })).toBeVisible({ timeout: 2_000 });
    }).toPass();
    await page.getByRole("menuitemradio", { name: "Oscuro" }).click();
  }
  expect(await tema(page)).toBe("oscuro");

  // Al recargar, el script del <head> lo pone antes de pintar: ya está en el primer HTML.
  let alCargar: string | undefined;
  page.once("domcontentloaded", async () => {
    alCargar = await tema(page);
  });
  await page.reload();
  await expect.poll(() => alCargar).toBe("oscuro");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(18, 11, 31)");
  if (info.project.name !== "movil")
    await expect(page.getByRole("button", { name: /Tema: Oscuro/ })).toBeVisible();
});

test("«Según el sistema» sigue la configuración del dispositivo", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tema", "sistema"));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect(await tema(page)).toBe("oscuro");
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => tema(page)).toBe("claro");
});
