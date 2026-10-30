import { expect, test } from "@playwright/test";
import { ingresar } from "./utilidades";

/*
 * Tras «Revisar y enviar» con errores, el resumen toma el foco una vez. Al corregir un campo,
 * el foco se queda en él: antes volvía al resumen con cada tecla y no dejaba escribir.
 */
test("después de un error se puede corregir el campo sin que el foco salte", async ({ page }) => {
  await ingresar(page, "ana@ejemplo.com");
  await page.goto("/participa");
  await page.getByRole("button", { name: "Revisar y enviar" }).click();
  const resumen = page.getByRole("alert").first();
  await expect(resumen).toBeVisible();
  await expect(resumen).toBeFocused();

  const descripcion = page.locator("#descripcion");
  await descripcion.click();
  await descripcion.pressSequentially("Una opinión escrita letra por letra");
  await expect(descripcion).toBeFocused();
  await expect(descripcion).toHaveValue("Una opinión escrita letra por letra");
});
