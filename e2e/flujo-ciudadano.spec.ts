import { expect, test, type Page } from "@playwright/test";
import { PDF, PNG, ciudadanoNuevo, elegir, ingresar, saltarRecorrido } from "./utilidades";

/*
 * Backlog 3.13: registrarse, verificar el correo, completar el perfil, verificar la cuenta con la
 * cédula (R18), enviar una propuesta y ver el cambio de estado. El Revisor se simula con /api/desarrollo/… (solo en desarrollo).
 */

/** La línea de tiempo de estados: la lista que marca el estado actual. */
const lineaDeTiempo = (page: Page) => page.getByRole("list").filter({ hasText: "(estado actual)" });

test("de registrarse a ver el cambio de estado de su propuesta", async ({ page }) => {
  // Recorre nueve rutas: con `next dev` en frío, cada una compila en su primera visita.
  test.slow();
  const c = ciudadanoNuevo();

  await test.step("registro como persona natural", async () => {
    await page.goto("/registro");
    await page.getByRole("link", { name: /Persona natural/ }).click();
    await page.locator("#cedulaNumero").fill(c.cedula);
    await page.getByLabel("Nombres").fill("Prueba");
    await page.getByLabel("Apellidos").fill("Automatizada");
    await page.getByLabel("Correo electrónico").fill(c.correo);
    await page.locator("#contrasena").fill(c.contrasena);
    await page.locator("#confirmarContrasena").fill(c.contrasena);
    await page.getByLabel(/Acepto los términos de uso/).check();
    await page.getByLabel(/Acepto la política de tratamiento/).check();
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page).toHaveURL(/\/registro\/revisa-tu-correo$/);
    // Reenviar queda en espera 60 s.
    await expect(page.getByRole("button", { name: /Reenviar el enlace en \d+ s/ })).toBeDisabled();
  });

  await test.step("verificación del correo", async () => {
    // En producción el enlace llega por correo; en desarrollo se muestra en pantalla.
    await page.getByRole("link", { name: "Abrir el enlace" }).click();
    await expect(
      page.getByRole("heading", { name: "¡Listo! Tu correo está verificado" }),
    ).toBeVisible();
  });

  await test.step("primer ingreso: lleva a Participa, sin la propuesta formal", async () => {
    await ingresar(page, c.correo, c.contrasena);
    await expect(page).toHaveURL(/\/participa$/);
    // Primer ingreso: el recorrido guiado se abre solo.
    await saltarRecorrido(page);
    await expect(page.getByRole("radio", { name: "Propuesta formal" })).toBeDisabled();
  });

  await test.step("completa el perfil con el teléfono: aún sin verificar", async () => {
    await page.goto("/mi-cuenta");
    await expect(page.getByRole("progressbar", { name: "Avance del perfil" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await page.getByLabel("Teléfono de contacto").fill("04141234567");
    await page.getByRole("button", { name: "Guardar datos" }).click();
    await expect(page.getByText("Tu perfil está completo: ya puedes participar.")).toBeVisible();
    await expect(page.getByText("Estado de verificación: Verificado")).toHaveCount(0);
    await page.goto("/participa");
    await expect(page.getByRole("radio", { name: "Propuesta formal" })).toBeDisabled();
  });

  await test.step("verificación: carga la cédula y se habilita la propuesta", async () => {
    await page.goto("/mi-cuenta");
    const verificacion = page.getByRole("region", {
      name: "Verificación para propuestas formales",
    });
    await expect(verificacion).toContainText("necesitas una verificación extra: cargar tu cédula");
    await page.locator("#archivo-IDENTIDAD").setInputFiles(PNG);
    await page.getByRole("button", { name: "Subir documento" }).click();
    await expect(
      page.getByText("Tu cuenta está verificada: ya puedes enviar propuestas formales."),
    ).toBeVisible();
    // La verificación es automática al cargar los documentos: no espera al Revisor.
    await expect(page.getByText("Estado de verificación: Verificado")).toBeVisible();
  });

  let folio = "";
  await test.step("envía una propuesta formal y recibe el folio", async () => {
    await page.getByRole("status").getByRole("link", { name: "Participa" }).click();
    await expect(page).toHaveURL(/\/participa\?tipo=propuesta$/);
    await expect(page.getByRole("radio", { name: "Propuesta formal" })).toBeChecked();
    await elegir(page, /^Parroquia/, "Catedral");
    await page.getByLabel(/Comunidad, barrio o sector/).fill("Centro histórico");
    // La propuesta formal exige la ubicación: se pega un enlace de Google Maps con coordenadas.
    await page.locator("#ubicacion-enlace").fill("https://www.google.com/maps?q=10.0678,-69.3467");
    await page.getByRole("button", { name: "Usar enlace" }).click();
    await expect(page.getByText(/Punto marcado: 10\.06780, -69\.34670/)).toBeVisible();
    await elegir(page, /área del plan/, "Vialidad y Transporte");
    await page
      .getByLabel("Tu propuesta")
      .fill(
        "Propuesta de prueba automatizada: ampliar las aceras de la avenida 20 y ordenar el transporte público en el centro.",
      );
    await page.locator("#soporte").setInputFiles(PDF);
    // Sin responder si aparece el nombre, no deja seguir: la pregunta no trae respuesta por defecto.
    await page.getByRole("button", { name: "Revisar y enviar" }).click();
    await expect(page.getByText("Elige si quieres que aparezca tu nombre.").first()).toBeVisible();
    await page.getByRole("radio", { name: /^Sí, como/ }).check();
    await page.getByRole("button", { name: "Revisar y enviar" }).click();

    const dialogo = page.getByRole("dialog", { name: "Confirma tu envío" });
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText("Una vez enviada no podrás editarla ni eliminarla.");
    await dialogo.getByRole("button", { name: "Confirmar envío" }).click();

    await expect(page).toHaveURL(/\/participa\/enviada\?folio=IRI-\d{4}-\d{4}/);
    folio = new URL(page.url()).searchParams.get("folio")!;
    await expect(page.getByText(folio, { exact: true })).toBeVisible();
  });

  await test.step("aparece Pendiente en «Mis participaciones»", async () => {
    await page.goto(`/mi-cuenta/participaciones/${folio}`);
    await expect(lineaDeTiempo(page).getByRole("listitem")).toHaveCount(1);
    await expect(lineaDeTiempo(page)).toContainText("Pendiente");
  });

  await test.step("el Revisor la evalúa y la aprueba", async () => {
    const cambiar = (estado: string, comentario?: string) =>
      page.request.post(`/api/desarrollo/participaciones/${folio}/estado`, {
        data: { estado, comentario },
      });
    expect((await cambiar("EN_REVISION")).status()).toBe(200);
    expect(
      (await cambiar("APROBADA", "Se incorpora al diagnóstico de movilidad del centro.")).status(),
    ).toBe(200);
  });

  await test.step("ve el cambio de estado y el comentario del revisor", async () => {
    await page.reload();
    const ultimo = lineaDeTiempo(page).getByRole("listitem").last();
    await expect(ultimo).toContainText("Verificada");
    await expect(ultimo).toContainText("(estado actual)");
    await expect(ultimo).toContainText("Se incorpora al diagnóstico de movilidad del centro.");
    await expect(lineaDeTiempo(page).getByRole("listitem")).toHaveCount(3);
    // Inmutable: sin editar ni eliminar.
    await expect(page.getByRole("button", { name: /Editar|Eliminar/ })).toHaveCount(0);
  });
});
