import { defineConfig, devices } from "@playwright/test";

/*
 * Pruebas E2E (backlog 3.13). Corren contra `next dev` porque, mientras no exista plataforma-api,
 * el flujo depende del simulador de desarrollo: el enlace de verificación aparece en pantalla y
 * el cambio de estado lo hace /api/desarrollo/… en lugar del Revisor.
 * En local reutiliza el `pnpm dev` que ya esté abierto en el puerto 3000.
 */
const PUERTO = 3000;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // La primera visita a cada ruta compila en `next dev`.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-VE",
    timezoneId: "America/Caracas",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    // 375 px, el ancho de teléfono con el que se revisa el portal.
    {
      name: "movil",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, hasTouch: true },
    },
  ],
  webServer: {
    command: `next dev -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
