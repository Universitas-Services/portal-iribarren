import { expect, test } from "@playwright/test";
import { ingresar } from "./utilidades";

/*
 * Recorrido guiado: la brújula junto al agente lo abre en cualquier página, con o sin sesión. El
 * primer ingreso de una cuenta lo abre solo (cubierto en flujo-ciudadano y sesion).
 */

const brujula = "Recorrido guiado de esta página";

test("sin sesión: se abre en el Inicio, avanza, retrocede y se cierra con Escape", async ({
  page,
}) => {
  await page.goto("/");
  const boton = page.getByRole("button", { name: brujula });
  await boton.click();

  const recorrido = page.getByRole("dialog").filter({ hasText: /Paso \d+ de \d+/ });
  await expect(recorrido).toContainText("Paso 1 de 8");
  await expect(recorrido.getByRole("heading")).toHaveText("¿En qué va el plan?");
  await expect(recorrido).toBeFocused();

  await recorrido.getByRole("button", { name: "Siguiente" }).click();
  await expect(recorrido).toContainText("Paso 2 de 8");
  await recorrido.getByRole("button", { name: "Anterior" }).click();
  await expect(recorrido).toContainText("Paso 1 de 8");
  // Con el teclado: la flecha avanza.
  await page.keyboard.press("ArrowRight");
  await expect(recorrido).toContainText("Paso 2 de 8");

  await page.keyboard.press("Escape");
  await expect(recorrido).toHaveCount(0);
  await expect(boton).toBeFocused();
});

test("el último paso explica la brújula y sin sesión invita a registrarse", async ({ page }) => {
  await page.goto("/documentos");
  await page.getByRole("button", { name: brujula }).click();
  const recorrido = page.getByRole("dialog").filter({ hasText: /Paso \d+ de \d+/ });
  await expect(recorrido).toContainText("Busca un documento");
  await recorrido.getByRole("button", { name: "Siguiente" }).click();
  await recorrido.getByRole("button", { name: "Siguiente" }).click();
  await expect(recorrido.getByRole("heading")).toHaveText("Inicia sesión o regístrate");
  await recorrido.getByRole("button", { name: "Siguiente" }).click();
  await expect(recorrido.getByRole("heading")).toHaveText("Este recorrido, cuando quieras");
  await recorrido.getByRole("button", { name: "Terminar" }).click();
  await expect(recorrido).toHaveCount(0);
});

test("con sesión: el recorrido de Mi cuenta y sin apertura automática", async ({ page }) => {
  await ingresar(page, "ana@ejemplo.com");
  await page.goto("/mi-cuenta");
  // Ana ya vio el recorrido: no se abre solo.
  await page.waitForTimeout(1500);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: brujula }).click();
  const recorrido = page.getByRole("dialog").filter({ hasText: /Paso \d+ de \d+/ });
  await expect(recorrido.getByRole("heading")).toHaveText("Tu perfil");
  await recorrido.getByRole("button", { name: "Saltar el recorrido" }).click();
  await expect(recorrido).toHaveCount(0);
});
