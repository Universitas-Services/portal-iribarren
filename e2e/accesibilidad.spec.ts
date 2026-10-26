import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { elegir, ingresar } from "./utilidades";

/*
 * Backlog 3.13: auditoría automática WCAG 2.1 A y AA con axe-core, en escritorio y a 375 px.
 * axe detecta cerca de un tercio de los problemas; el teclado, el foco y los lectores de
 * pantalla se revisan además a mano (ver docs/ACCESIBILIDAD.md).
 */

const ETIQUETAS_WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Sin movimiento, el contenido se ve en su estado final: las entradas ligadas al scroll
// (`animation-timeline: view()`) dejan semitransparente lo que aún no se ha desplazado.
test.use({ reducedMotion: "reduce" });

async function auditar(page: Page) {
  // Espera a que el contenido en streaming reemplace a los skeletons.
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".skeleton")).toHaveCount(0);
  // Toda imagen del portal describe lo que muestra (axe acepta alt="" como decorativa).
  await expect(
    page.locator('main img:not([alt]), main img[alt=""], header img[alt=""]'),
  ).toHaveCount(0);
  const { violations } = await new AxeBuilder({ page })
    .withTags(ETIQUETAS_WCAG)
    // Indicador y overlay de `next dev`: no son parte del portal.
    .exclude("nextjs-portal")
    .analyze();
  const resumen = violations.map((v) => ({
    regla: v.id,
    impacto: v.impact,
    ayuda: v.help,
    nodos: v.nodes.map((n) => `${n.target.join(" ")} → ${n.any[0]?.message ?? n.failureSummary}`),
  }));
  expect(resumen, JSON.stringify(resumen, null, 2)).toEqual([]);
}

const PUBLICAS = [
  "/",
  "/conoce-el-pdul",
  "/noticias",
  "/noticias?categoria=Normativa",
  "/noticias/vision-de-futuro-conversacion-publica",
  "/noticias/gaceta-5256-decreto-48-2026",
  "/noticias/anuncio-decreto-48-aniversario",
  "/noticias/tres-compromisos-alcalde-pdul",
  "/noticias/primera-mesa-tecnica-concejo-alcaldia",
  "/documentos",
  "/documentos/decreto-48-2026",
  "/propuestas",
  "/propuestas/IRI-2026-0001",
  "/registro",
  "/registro?tipo=natural",
  "/registro?tipo=organizacion",
  "/ingresar",
  "/recuperar",
  "/restablecer?token=no-existe",
  "/verificar?token=demo-vencido",
  "/terminos",
  "/politica-de-datos",
  "/esta-pagina-no-existe",
];

test.describe("páginas públicas", () => {
  for (const ruta of PUBLICAS) {
    test(ruta, async ({ page }) => {
      await page.goto(ruta);
      await auditar(page);
    });
  }
});

const CON_SESION: { correo: string; rutas: string[] }[] = [
  {
    correo: "ana@ejemplo.com",
    rutas: [
      "/mi-cuenta",
      "/mi-cuenta/seguridad",
      "/participa",
      "/participa?noticia=vision-de-futuro-conversacion-publica",
      "/participa/enviada?folio=IRI-2026-0005",
      "/mi-cuenta/participaciones",
      "/mi-cuenta/participaciones?estado=RECHAZADA",
      "/mi-cuenta/participaciones/IRI-2026-0003",
      "/mi-cuenta/participaciones/IRI-2026-0001",
    ],
  },
  { correo: "jose@ejemplo.com", rutas: ["/mi-cuenta", "/participa"] },
  // Perfil a medias: un paso hecho y plegado, el del documento abierto.
  { correo: "rosa@ejemplo.com", rutas: ["/mi-cuenta"] },
  { correo: "contacto@cardones.org", rutas: ["/mi-cuenta", "/mi-cuenta/seguridad"] },
];

test.describe("páginas con sesión", () => {
  for (const { correo, rutas } of CON_SESION) {
    test(correo, async ({ page }) => {
      test.slow();
      await ingresar(page, correo);
      for (const ruta of rutas) {
        await test.step(ruta, async () => {
          await page.goto(ruta);
          await auditar(page);
        });
      }
    });
  }
});

test.describe("estados interactivos", () => {
  test("registro con errores de validación", async ({ page }) => {
    await page.goto("/registro?tipo=natural");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await auditar(page);
  });

  test("cambio de contraseña con errores", async ({ page }) => {
    await ingresar(page, "ana@ejemplo.com");
    await page.goto("/mi-cuenta/seguridad");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await auditar(page);
  });

  test("edición de nombres abierta", async ({ page }) => {
    await ingresar(page, "ana@ejemplo.com");
    await page.goto("/mi-cuenta");
    await page.getByText("Editar").first().click();
    await expect(page.getByRole("button", { name: "Guardar nombres" })).toBeVisible();
    await auditar(page);
  });

  test("ingreso con credenciales incorrectas", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByLabel("Correo electrónico").fill("ana@ejemplo.com");
    await page.locator("#contrasena").fill("NoEsLaClave#1");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByText("El correo o la contraseña no son correctos.")).toBeVisible();
    await auditar(page);
  });

  test("selector abierto y confirmación de envío", async ({ page }) => {
    await ingresar(page, "ana@ejemplo.com");
    await page.goto("/participa");
    await page.getByRole("combobox", { name: /^Parroquia/ }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await auditar(page);
    await page.getByRole("option", { name: "Catedral", exact: true }).click();

    await page.getByLabel("Comunidad, barrio o sector").fill("Centro");
    await elegir(page, /área del plan/, "Vialidad y Transporte");
    await page
      .getByLabel("Tu opinión")
      .fill("Opinión de prueba para revisar la accesibilidad del diálogo de confirmación.");
    await page.getByRole("button", { name: "Revisar y enviar" }).click();
    await expect(page.getByRole("dialog", { name: "Confirma tu envío" })).toBeVisible();
    await auditar(page);
  });

  test("filtros de noticias con el calendario abierto", async ({ page }) => {
    await page.goto("/noticias");
    await page.locator('button[aria-haspopup="dialog"]').first().click();
    await expect(page.getByRole("dialog", { name: "Elegir rango de fechas" })).toBeVisible();
    await auditar(page);
  });
});
