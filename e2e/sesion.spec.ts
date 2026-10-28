import { expect, test } from "@playwright/test";
import { ciudadanoNuevo, ingresar } from "./utilidades";

/*
 * Sesión e historial: tras iniciar o cerrar sesión, «atrás» no debe volver a mostrar el
 * formulario de ingreso ni los datos de la cuenta. Y la cuenta del ciudadano: contraseña y
 * nombres.
 */

test.describe("protección de rutas e historial", () => {
  test("tras iniciar sesión, «atrás» no vuelve al formulario de ingreso", async ({ page }) => {
    await page.goto("/noticias");
    await ingresar(page, "ana@ejemplo.com");
    await expect(page).toHaveURL(/\/mi-cuenta$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/noticias$/);
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toHaveCount(0);
  });

  test("con la sesión abierta, ingreso y registro llevan a la cuenta", async ({ page }) => {
    await ingresar(page, "ana@ejemplo.com");
    for (const ruta of ["/ingresar", "/registro", "/registro?tipo=natural", "/recuperar"]) {
      await page.goto(ruta);
      await expect(page).toHaveURL(/\/mi-cuenta(\/seguridad)?$/);
    }
    await page.goto("/ingresar?volver=/mi-cuenta/participaciones");
    await expect(page).toHaveURL(/\/mi-cuenta\/participaciones$/);
  });

  test("tras cerrar sesión, «atrás» no muestra la cuenta", async ({ page }) => {
    await page.goto("/noticias");
    await ingresar(page, "ana@ejemplo.com");
    await page.goto("/mi-cuenta/seguridad");
    // Con varias pruebas en paralelo, esperar la carga evita pulsar antes de la hidratación.
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/ingresar\?volver=/);
    await expect(page.getByText("ana@ejemplo.com")).toHaveCount(0);
  });

  test("sin sesión, las páginas privadas piden ingresar y luego regresan", async ({ page }) => {
    await page.goto("/mi-cuenta/seguridad");
    await expect(page).toHaveURL(/\/ingresar\?volver=%2Fmi-cuenta%2Fseguridad/);
    await page.getByLabel("Correo electrónico").fill("ana@ejemplo.com");
    await page.locator("#contrasena").fill("Iribarren#2026");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/mi-cuenta\/seguridad$/);
  });
});

test.describe("cuenta del ciudadano", () => {
  test("cambia la contraseña: entra con la nueva y no con la anterior", async ({ page }) => {
    test.slow();
    const c = ciudadanoNuevo();
    const nueva = "Cambiada#E2e2026";

    await page.goto("/registro?tipo=natural");
    await page.locator("#cedulaNumero").fill(c.cedula);
    await page.getByLabel("Nombres").fill("Prueba");
    await page.getByLabel("Apellidos").fill("Contraseña");
    await page.getByLabel("Correo electrónico").fill(c.correo);
    await page.locator("#contrasena").fill(c.contrasena);
    await page.locator("#confirmarContrasena").fill(c.contrasena);
    await page.getByLabel(/Acepto los términos de uso/).check();
    await page.getByLabel(/Acepto la política de tratamiento/).check();
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await page.getByRole("link", { name: "Abrir el enlace" }).click();
    await expect(page.getByRole("heading", { name: /correo está verificado/ })).toBeVisible();
    await ingresar(page, c.correo, c.contrasena);

    await page.goto("/mi-cuenta/seguridad");
    await page.locator("#contrasenaActual").fill("NoEsLaClave#1");
    await page.locator("#contrasena").fill(nueva);
    await page.locator("#confirmarContrasena").fill(nueva);
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("La contraseña actual no es correcta.").first()).toBeVisible();

    await page.locator("#contrasenaActual").fill(c.contrasena);
    await page.locator("#contrasena").fill(nueva);
    await page.locator("#confirmarContrasena").fill(nueva);
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Contraseña actualizada" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    // Cerrar sesión lleva al inicio: se espera para no llegar al ingreso con la sesión abierta.
    await page.waitForURL((u) => u.pathname === "/");
    await page.goto("/ingresar");
    await page.getByLabel("Correo electrónico").fill(c.correo);
    await page.locator("#contrasena").fill(c.contrasena);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByText("El correo o la contraseña no son correctos.")).toBeVisible();
    await ingresar(page, c.correo, nueva);
    await expect(page).toHaveURL(/\/mi-cuenta/);

    // Y corrige sus nombres desde Perfil.
    await page.goto("/mi-cuenta");
    await page.getByText("Editar").first().click();
    await page.getByLabel("Nombres").fill("Prueba Corregida");
    await page.getByRole("button", { name: "Guardar nombres" }).click();
    await expect(page.getByRole("heading", { name: "Hola, Prueba" })).toBeVisible();
    await expect(page.getByText("Prueba Corregida", { exact: true })).toBeVisible();
  });

  test("las pestañas de Mi cuenta marcan la sección actual", async ({ page }) => {
    await ingresar(page, "ana@ejemplo.com");
    const pestanas = page.getByRole("navigation", { name: "Secciones de mi cuenta" });
    for (const [nombre, ruta] of [
      ["Seguridad", /\/mi-cuenta\/seguridad$/],
      ["Mis participaciones", /\/mi-cuenta\/participaciones$/],
      ["Perfil", /\/mi-cuenta$/],
    ] as const) {
      await pestanas.getByRole("link", { name: nombre }).click();
      await expect(page).toHaveURL(ruta);
      await expect(pestanas.getByRole("link", { name: nombre })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });
});
