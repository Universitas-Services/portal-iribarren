import { expect, test } from "@playwright/test";
import { ingresar } from "./utilidades";

/*
 * Backlog 3.13: criterios WCAG 2.1 AA que axe no comprueba solo: teclado (2.1.1, 2.4.1, 2.4.3,
 * 2.4.7), pausa del movimiento (2.2.2) y reflujo a 320 px (1.4.10).
 */

test("el primer Tab muestra «Saltar al contenido» y lleva al contenido principal", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await expect(saltar).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
});

test("el foco siempre es visible al recorrer el Inicio con Tab", async ({ page }) => {
  await page.goto("/");
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const visible = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return true;
      const s = getComputedStyle(el);
      const anillo = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      const sombra = s.boxShadow !== "none";
      // Las tarjetas marcan el foco en el contenedor (focus-within).
      const contenedor = el.closest(".group, label");
      const deContenedor =
        !!contenedor &&
        (getComputedStyle(contenedor).boxShadow !== "none" ||
          getComputedStyle(contenedor).outlineStyle !== "none");
      return anillo || sombra || deContenedor;
    });
    expect(visible, `Tab ${i + 1}: el elemento enfocado no muestra el foco`).toBe(true);
  }
});

test("el carrusel del Inicio se puede pausar y manejar con teclado", async ({ page }) => {
  await page.goto("/");
  const carrusel = page.getByRole("region", { name: "Anuncios del PDUL" });
  const pausar = carrusel.getByRole("button", { name: /Pausar el carrusel|Reanudar el carrusel/ });
  await pausar.focus();
  await page.keyboard.press("Enter");
  await expect(carrusel.getByRole("button", { name: /Reanudar el carrusel/ })).toBeVisible();
  const segundo = carrusel.getByRole("button", { name: /Ir al anuncio 2/ });
  await segundo.focus();
  await page.keyboard.press("Enter");
  await expect(segundo).toHaveAttribute("aria-current", /true/);
});

test("el diálogo de confirmación se cierra con Escape y devuelve el foco", async ({ page }) => {
  await ingresar(page, "ana@ejemplo.com");
  await page.goto("/mi-cuenta/seguridad");
  const abrir = page.getByRole("button", { name: "Solicitar la baja de la cuenta" });
  await abrir.focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", { name: "¿Solicitar la baja de tu cuenta?" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(abrir).toBeFocused();
});

test("el selector propio funciona solo con teclado", async ({ page }) => {
  await ingresar(page, "ana@ejemplo.com");
  await page.goto("/participa");
  const parroquia = page.getByRole("combobox", { name: /^Parroquia/ });
  await parroquia.focus();
  await page.keyboard.press("ArrowDown");
  await expect(parroquia).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(parroquia).toHaveAttribute("aria-expanded", "false");
  await expect(parroquia).toContainText("Águedo Felipe Alvarado");
  await expect(parroquia).toBeFocused();
});

test.describe("menú principal en una sola línea", () => {
  for (const ancho of [1024, 1280]) {
    for (const sesion of [false, true]) {
      test(`${ancho} px ${sesion ? "con" : "sin"} sesión`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 800 });
        if (sesion) await ingresar(page, "ana@ejemplo.com");
        await page.goto("/");
        const enlaces = page.locator('header nav[aria-label="Principal"] a');
        await expect(enlaces).toHaveCount(6);
        const alturas = await enlaces.evaluateAll((els) =>
          els.map((e) => [e.textContent, e.getBoundingClientRect().height] as const),
        );
        // Una línea de texto: ninguna etiqueta se parte (≈ 34 px con su relleno).
        for (const [texto, alto] of alturas) expect(alto, `«${texto}»`).toBeLessThan(44);
        const desborde = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(desborde).toBeLessThanOrEqual(0);
      });
    }
  }
});

const REFLUJO = [
  "/",
  "/conoce-el-pdul",
  "/noticias",
  "/noticias/reunion-auditoria-legal-institucional",
  "/documentos",
  "/documentos/decreto-48-2026",
  "/propuestas",
  "/registro?tipo=natural",
];

test.describe("reflujo a 320 px sin scroll horizontal", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  for (const ruta of REFLUJO) {
    test(ruta, async ({ page }) => {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const desborde = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(desborde).toBeLessThanOrEqual(0);
    });
  }
});
