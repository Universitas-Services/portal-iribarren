# Contexto del proyecto PDUL YA (portal y admin)

Documento para retomar el trabajo en otro equipo o en una conversación nueva con Claude Code, sin depender del historial anterior. Es igual en `portal-iribarren/docs/CONTEXTO.md` y en `plataforma-admin/docs/CONTEXTO.md`.

Fecha de corte: 17 de octubre de 2026.

---

## 0. Antes de irte del equipo actual (checklist)

1. **Commit y push de `feat/noticias-v4`** en `portal-iribarren`. Las ramas `feat/*` están apiladas: cada una sale de la anterior, y solo `feat/base-visual-inicio` está en GitHub. Con subir `feat/noticias-v4` subes todo el trabajo:
   - `feat/documentos-y-conoce-pdul` → `feat/registro-y-acceso` → `feat/perfil-y-participacion` → `feat/conoce-y-seguimiento` → `feat/noticias-v4`.
   ```bash
   git push -u origin feat/noticias-v4
   ```
   Si quieres conservar las ramas intermedias para hacer PRs por bloque, súbelas también (`git push -u origin <rama>` para cada una).
2. **Push de `plataforma-admin`**: rama `chore/tooling-base`, sin cambios pendientes salvo este documento.
3. **Documentos del cliente**: no están en los repos. Llévalos aparte, por ejemplo en una carpeta `Pdull/` junto a los dos repos:
   - `Backlog_Tecnico_Repositorios.docx`: backlog por repositorio. Sección 2 = admin, sección 3 = portal, sección 1 = API.
   - `SRS_Plataforma_Participacion.docx` / `.pdf`, `Desglose_Tareas_Tecnicas.pdf`, `Flujo_Esperado_MVP.pdf`, `PLAN_PDUL_Iribarren.md`.
   - `Propuesta Gestión Ciudadana PDUL YA (3).pdf`: la **v3**, documento técnico (roles, formularios, máquina de estados).
   - `Propuesta Gestión Ciudadana PDUL YA (4).pdf`: la **v4**, solo las 9 noticias reales.
   - La carpeta `para noticias`: fotos, video y Gaceta originales. Ya están copiados a `public/` del portal.

## 1. Arranque en el equipo nuevo

```bash
git clone https://github.com/Universitas-Services/portal-iribarren.git
git clone https://github.com/Universitas-Services/plataforma-admin.git
cd portal-iribarren && git checkout feat/noticias-v4 && pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```

- **Requisitos:** Node ≥ 24 y pnpm 12.3.4 (`corepack enable`).
- **Admin:** `pnpm dev` en el puerto 3001.
- **Comandos de calidad** (los mismos que corre la CI): `pnpm format:check`, `pnpm lint`, `pnpm typecheck` (en el portal es `next typegen && tsc --noEmit`), `pnpm test` y `pnpm build`.
- **Cuentas de demostración del portal**, todas con la contraseña `Iribarren#2026`:

| Correo                  | Caso                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `ana@ejemplo.com`       | Perfil completo (verificado), 5 participaciones en todos los estados |
| `jose@ejemplo.com`      | Perfil vacío: para recorrer el asistente de perfil                   |
| `rosa@ejemplo.com`      | Perfil a medias: tiene el teléfono, falta el documento de identidad  |
| `luis@ejemplo.com`      | Correo sin verificar                                                 |
| `carla@ejemplo.com`     | Cuenta de otra alcaldía: pasa por «Unirme a Iribarren»               |
| `contacto@cardones.org` | Organización con perfil incompleto                                   |

- **Enlaces de ejemplo:** `/verificar?token=demo-vencido` y `/verificar?token=demo-usado`.
- Los datos viven en memoria y se reinician con el servidor de desarrollo.

## 2. Instrucciones para Claude (pegar al iniciar la conversación)

> Trabajo en PDUL YA, el portal de participación ciudadana de la Alcaldía de Iribarren. Lee `docs/CONTEXTO.md` antes de empezar. Reglas:
>
> - **Responde siempre en español.**
> - **Yo hago los commits y el push.** Tú no ejecutas `git commit`, `git push`, ni creas PRs o merges salvo que te lo pida en ese mensaje. Prepara los cambios y propón mensajes Conventional Commits en español.
> - **Pregunta antes de descargar** archivos de internet: fuente, licencia y tamaño.
> - **No inventes textos oficiales.** Marca el contenido de ejemplo como tal y da el crédito de las imágenes CC (CC BY-SA).
> - **Next.js 16 no es el que conoces:** lee la guía en `node_modules/next/dist/docs/` antes de usar una API (ver `AGENTS.md`).
> - **Verifica en el navegador**, a escritorio y 375 px, y corre los checks antes de dar algo por hecho.

Los dos repos traen en `.claude/skills/` las skills `flujo-git` (la regla de los commits), `impeccable`, `design-taste-frontend` y `emil-design-eng`.

## 3. El proyecto

- **Qué es:** PDUL YA (Plan de Desarrollo Urbano Local, municipio Iribarren, Barquisimeto) es una plataforma multi-alcaldía de participación ciudadana. Durante la formulación del PDUL 2026–2046, la ciudadanía se informa (noticias, documentos, Conoce) y envía opiniones y propuestas con folio y seguimiento.
- **Repositorios:**
  - `portal-iribarren`: el portal ciudadano en Next.js. Lo hacemos nosotros.
  - `plataforma-admin`: el panel interno en Next.js (Super Admin, Representantes, Admin de alcaldía, Operador y Revisor). Lo hacemos nosotros.
  - `plataforma-api`: NestJS. **Lo hace otra persona.** Mientras no exista, el portal usa datos y servicios simulados con la misma forma que los endpoints del backlog.
- **Fuentes de verdad, por orden:**
  1. lo que diga el usuario o el cliente en la conversación;
  2. la Propuesta v3 (técnica) y la v4 (noticias);
  3. el texto de «Conoce el PDUL» que entregó el cliente, ya volcado en `src/lib/conoce/contenido.ts`;
  4. el backlog;
  5. el SRS.
- **Identidad visual:**
  - colores definidos como tokens en `src/app/globals.css`: rojo `#c32026`, noche `#232a36`, naranja, amarillo, papel, superficie, línea, éxito y éxito-oscuro `#1d6e33`;
  - tipografía display más sans;
  - más detalle en `DESIGN.md` y `PRODUCT.md` del portal.

## 4. Decisiones tomadas (no volver a discutirlas)

| Tema                 | Decisión                                                                                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Participar           | Opinar solo pide la sesión. La propuesta formal exige el perfil COMPLETO, que queda VERIFICADO automáticamente. No hay perfiles rechazados: se rechazan propuestas formales, no personas (28-10-2026).                                                                                                     |
| Organizaciones       | Solo como cuentas propias (v3): se registran con el correo institucional, sin cédula. El representante llega en el perfil. No hay vínculo persona-organización ni selector «actuar como».                                                                                                                  |
| Unicidad             | Correo y RIF únicos; cédula única para las personas. Membresías por alcaldía para todos los tipos de cuenta.                                                                                                                                                                                               |
| Teléfono y ocupación | Se piden en el perfil, no en el registro.                                                                                                                                                                                                                                                                  |
| Datos de la cuenta   | Nombres y apellidos editables (persona natural), sin cambiar el estado de verificación. Cédula, RIF, razón social y correo cambian vía soporte. Cambiar la contraseña pide la actual y cierra las demás sesiones.                                                                                          |
| Sesión e historial   | Las Server Actions redirigen con `RedirectType.replace` (función `ir()` en `acciones.ts`). Las páginas de invitado llaman a `soloInvitados()`; `src/proxy.ts` manda sin cookie a `/ingresar?volver=…` en las privadas.                                                                                     |
| Parroquias           | 10: Concepción, Catedral, El Cují, Tamaca, Ana Soto, Santa Rosa, Unión, Juárez, Buena Vista y Águedo Felipe Alvarado.                                                                                                                                                                                      |
| Cédula               | V con 5 a 8 dígitos y E con 5 a 9, solo números. Se normaliza a `V-12345678`.                                                                                                                                                                                                                              |
| RIF                  | J, G o C, 8 dígitos y el **dígito verificador SENIAT** (módulo 11: letra V1 E2 J3 P4 G5 C3 × 4, pesos 3-2-7-6-5-4-3-2). Ejemplo válido: `J-07013380-5`.                                                                                                                                                    |
| Nombres              | Solo letras (con tildes, ñ y ü) y espacios, de 2 a 100 caracteres.                                                                                                                                                                                                                                         |
| Adjuntos del aporte  | En los tres tipos: hasta **5 fotos** (JPG, PNG o WebP de 2 MB) y **1 enlace de video** (YouTube o Instagram; no se sube el archivo), combinables. La **propuesta formal** exige además su documento de soporte (PDF, JPG o PNG de 2 MB).                                                                   |
| Folio                | `IRI-AAAA-XXXX`, idempotente por `Idempotency-Key` (un doble clic no crea dos).                                                                                                                                                                                                                            |
| Galería pública      | Toda participación PUBLICADA, sin datos de contacto. Sin nombre autorizado (`mostrarNombre`), el autor es «Ciudadano de Iribarren» (28-10-2026).                                                                                                                                                           |
| Conoce el PDUL       | Texto del cliente. Las **4 fases** (24 meses) son el contenido principal; los **7 hitos** del termómetro se muestran como «¿En qué va el proceso?». Solo la Fase I tiene duración (meses 1 a 6). Marco legal: solo la cadena del cliente (CRBV → LOOU → LOPPM → Sentencia 928 → MINFRA → Decreto 48-2026). |
| Nombre del alcalde   | **Yanys Enrique Agüero**. La v4 a veces dice «Yanis»: se corrige siempre.                                                                                                                                                                                                                                  |
| Noticias             | Las 9 de la v4 son las reales. Las de ejemplo se quedan con la marca `ejemplo: true`: llevan el rótulo «Ejemplo» y nunca van al Inicio. Destacadas en portada: Visión de futuro, la reunión de auditoría y la primera mesa técnica.                                                                        |
| Selectores           | Componente propio (`src/components/ui/selector.tsx`), no `<select>` nativo.                                                                                                                                                                                                                                |

## 5. Estado del portal (`portal-iribarren`)

### Rutas por pantalla del backlog

| Backlog                    | Rutas                                                                                                                                            | Estado                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.3 Inicio                 | `/`                                                                                                                                              | Hecho (termómetro, banners vigentes y ordenados, 3 noticias, llamadas a la acción)                                                                                                                    |
| 3.4 Conoce                 | `/conoce-el-pdul`                                                                                                                                | Hecho con el contenido del cliente                                                                                                                                                                    |
| 3.5 Noticias               | `/noticias`, `/noticias/[slug]`                                                                                                                  | Hecho: mosaico por formato (texto, imagen, galería, documento, video), filtros por URL, rango de fechas con atajos, paginación                                                                        |
| 3.6 Documentos             | `/documentos`, `/documentos/[slug]`                                                                                                              | Hecho (visor PDF, versiones, estado oficial o borrador)                                                                                                                                               |
| 3.7–3.8 Registro y acceso  | `/registro`, `/registro/revisa-tu-correo`, `/verificar`, `/ingresar`, `/unirme`, `/recuperar`, `/restablecer`, `/terminos`, `/politica-de-datos` | Hecho (auth simulada)                                                                                                                                                                                 |
| 3.9 Perfil                 | `/mi-cuenta`, `/mi-cuenta/seguridad`                                                                                                             | Hecho: pestañas Perfil · Seguridad · Mis participaciones; asistente por pasos, documentos, verificación automática, nombres editables; contraseña, cerrar sesión, abandonar el portal y pedir la baja |
| 3.10 Participación         | `/participa`, `/participa/enviada`                                                                                                               | Hecho: gate, tipos, fotos y video, confirmación, folio, comprobante imprimible                                                                                                                        |
| 3.11 Mis participaciones   | `/mi-cuenta/participaciones`, `/mi-cuenta/participaciones/[folio]`                                                                               | Hecho: filtros, búsqueda por folio, línea de tiempo                                                                                                                                                   |
| 3.12 Propuestas publicadas | `/propuestas`, `/propuestas/[folio]`                                                                                                             | Hecho                                                                                                                                                                                                 |
| 3.1 portal-core            | —                                                                                                                                                | **Pendiente**                                                                                                                                                                                         |
| 3.13 Calidad y E2E         | `e2e/`, `docs/ACCESIBILIDAD.md`                                                                                                                  | Hecho: E2E del flujo completo, axe WCAG 2.1 AA en 40 pantallas y estados, teclado y reflujo; falta lector de pantalla real                                                                            |

### Arquitectura

- Next.js 16.4 (App Router) con **Cache Components**, React 19, Tailwind 4, Zod 4, Vitest. Hay CI en GitHub Actions.
- **Datos públicos simulados:** `src/lib/mocks/data.ts`, servidos por `src/lib/api/index.ts` (con `use cache`). La lógica pura está en `src/lib/noticias/consultas.ts` y `src/lib/documentos/consultas.ts`, con pruebas.
- **Auth y participación simuladas:** `src/lib/auth/`.
  - `servicio.ts`: lógica pura y probada. Registro neutro, IDENTITY_CONFLICT, tokens de un uso, perfil calculado, documentos con versión, folios, filtros y galería pública.
  - `fixtures.ts`: cuentas y participaciones de ejemplo.
  - `sesion.ts`: cookie httpOnly `pdul_sesion` y almacén en `globalThis.__pdulAuth`.
  - `acciones.ts`: Server Actions.
- **Validaciones:**
  - `src/lib/validation/common.ts` debe estar **idéntico** en portal y admin, igual que `common.test.ts`.
  - `schemas.ts` es propio de cada repo.
- **Componentes reutilizables:**
  - `ui/selector.tsx`: combobox ARIA, con hoja inferior en el teléfono.
  - `cuenta/campos.tsx`: Campo, CampoDocumento con prefijo y filtrado, CampoContrasena, ResumenErrores, BotonEnviar.
  - `cuenta/piezas.tsx`: CampoArchivo, CampoImagenes, CampoSelect, Dialogo nativo, Progreso.
  - `listado/filtros-url.tsx`: barra de filtros en la URL.
  - `listado/paginacion.tsx` y `listado/transicion.tsx`.
  - `participacion/aporte.tsx`: FichaAporte, LineaTiempoEstados, TarjetaAporte, InsigniaEstado.
- **Trampas de Next 16 ya resueltas:**
  - `cookies()` y `searchParams` se leen dentro de `<Suspense>`.
  - Las cookies solo se escriben en Server Actions.
  - `Date.now()` o `randomUUID()` en un render requieren `await connection()` antes.
  - Una ruta dinámica con Cache Components necesita `generateStaticParams` con **al menos un** parámetro.
  - Un módulo `"use client"` no debe exportar constantes que use un componente de servidor (llegan vacías): ponlas en `src/lib`.
  - `experimental.serverActions.bodySizeLimit = "13mb"`, por los archivos.
  - No uses `encType` en un `<form>` con acción-función.
- **Pruebas E2E:** `pnpm test:e2e` (Playwright contra `pnpm dev`, escritorio y 375 px). El Revisor se simula con `POST /api/desarrollo/participaciones/{folio}/estado`, que usa `cambiarEstadoParticipacion` y `TRANSICIONES` de `servicio.ts` (404 en producción).
- **Contraste:** sobre blanco o `superficie`, el texto en `tinta` no baja de /70.
- **Avisos de entorno:**
  - Si el panel del navegador está oculto, el contenido en streaming no se revela.
  - Tras cambiar `fixtures.ts` hay que **reiniciar** `pnpm dev`, porque el almacén vive en `globalThis`.

### Pendiente del portal

1. **3.1 portal-core:**
   - paquete compartido con el cliente de la API generado (OpenAPI), los helpers del BFF (inyectar `PORTAL_CLIENT_ID` y `PORTAL_CLIENT_SECRET` desde el servidor), y los hooks `useSession`, `useMembership`, `useProfileStatus` y `useBranding`;
   - formularios sin estilos rígidos;
   - plantilla de repositorio;
   - publicación en npm privado.

   Lo natural es extraerlo de lo que ya existe en `src/lib/auth`, `src/components/cuenta` y `src/lib/validation`.

2. **3.13 Calidad** (hecho lo automatizable, ver `docs/ACCESIBILIDAD.md`):
   - probar con NVDA y VoiceOver;
   - al integrar la API, leer el enlace de verificación desde un buzón de pruebas y cambiar el estado con la API del admin en lugar de `/api/desarrollo/…`.
3. **Integración con plataforma-api:**
   - reemplazar `src/lib/api/index.ts` y `src/lib/auth/servicio.ts` por llamadas al BFF (sección 8);
   - las pantallas no deberían cambiar.
4. **Pendientes del cliente:**
   - duraciones de las fases II a IV;
   - si «Decretos y normativas» y «Normativa» son de verdad dos categorías;
   - foto de la primera mesa técnica (22-09) y video del HCAMP (16-09), que la v4 deja vacíos; hoy son TEXTO e IMAGEN ilustrativa (el obelisco);
   - los textos oficiales de términos y política de datos;
   - el `SITE_URL` definitivo;
   - los banners del Inicio, que siguen siendo de ejemplo (uno enlaza a una noticia de ejemplo).
5. **Deuda técnica:**
   - los selectores propios no se pueden cambiar sin JavaScript (se podría agregar un `<select>` de respaldo en `<noscript>`);
   - el video `public/videos/tres-compromisos-pdul.mp4` pesa 10 MB y conviene comprimirlo (ffmpeg) y darle una portada propia;
   - las fotos de la v4 están en PNG de unos 300 KB (next/image las optimiza al servirlas).

## 6. Admin (`plataforma-admin`): qué hay y cómo seguir

**Estado actual:**

- Rama `chore/tooling-base`: Next 16.4.2, TypeScript estricto, Tailwind 4, ESLint, Prettier, Vitest, Husky, CI y Dependabot.
- `src/lib/validation/common.ts` sincronizado con el portal y `src/env.ts` con `API_URL`.
- Solo una página (`src/app/page.tsx`).
- **Primer arreglo pendiente:** cambiar el script `typecheck` a `next typegen && tsc --noEmit`, como en el portal. Sin eso la CI falla con `LayoutProps`.

**Patrón de cada pantalla (backlog 2):**

- estados de carga, vacío y error;
- toasts;
- confirmación modal antes de acciones irreversibles;
- validación con zod antes de enviar;
- errores de la API traducidos por código a mensajes en español.

**Orden sugerido, una rama por bloque:**

| Rama                           | Backlog    | Contenido                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat/fundaciones-bff`         | 2.1, 2.2   | BFF (route handlers proxy, cookie httpOnly, renovación del token), cliente tipado (orval) más TanStack Query, componentes base (DataTable con filtros en la URL y búsqueda con 300 ms de espera, FormField, FileUpload, ConfirmDialog, StatusBadge, EmptyState, PageHeader), toasts (sonner), middleware de rutas (sesión, onboarding, 403), tema dinámico por alcaldía                                    |
| `feat/acceso-admin`            | 2.3, 2.4   | Login con bloqueo temporal o cuenta desactivada; aceptar invitación (token, cédula V/E, contraseña); olvidé y restablecer                                                                                                                                                                                                                                                                                  |
| `feat/layout-admin`            | 2.5        | Sidebar según permisos, selector de alcaldía con «Operando en: X», menú de usuario, 403/404/500                                                                                                                                                                                                                                                                                                            |
| `feat/onboarding`              | 2.6        | Asistente: logo con recorte → colores con chequeo de contraste → lema → resumen                                                                                                                                                                                                                                                                                                                            |
| `feat/contenido-operador`      | 2.9        | Noticias (Tiptap, portada con recorte, autoguardado a los 30 s, programar, publicar, despublicar), banners (orden por arrastre, vigencia), repositorio documental (subir PDF con progreso, versiones). **Los 5 formatos de noticia del portal** (texto, imagen, galería, documento, video de archivo, YouTube o Instagram) y los campos de la v4: puntos de análisis, botón opcional, destacada en portada |
| `feat/participaciones-revisor` | 2.10       | Bandeja (conteos por estado como filtros, filtros, búsqueda por folio, autor o cédula), detalle en dos columnas (aporte con fotos, video y soporte, y la identidad del autor con sus documentos), control de identidad, transiciones válidas, rechazo con motivo de catálogo y texto de al menos 20 caracteres, publicar o despublicar (solo con nombre autorizado), notas internas, CSV                   |
| `feat/ciudadanos`              | 2.11       | Tabla (cédula enmascarada), detalle con documentos por URL firmada, suspender o reactivar la membresía, CSV                                                                                                                                                                                                                                                                                                |
| `feat/configuracion`           | 2.12       | Branding, catálogos (parroquias, categorías técnicas, de noticias y de documentos, ocupaciones, tipos de organización), editor de fases y fase actual con vista previa del termómetro                                                                                                                                                                                                                      |
| `feat/plataforma`              | 2.7, 2.8   | Alcaldías (crear, suspender, portales con `client_secret` mostrado una vez, rotar), representantes, entidades, usuarios internos (invitar con roles Operador o Revisor)                                                                                                                                                                                                                                    |
| `feat/bitacora-tablero`        | 2.13, 2.14 | Bitácora con diferencias antes y después, verificar integridad, CSV; tablero de indicadores                                                                                                                                                                                                                                                                                                                |
| `chore/calidad-admin`          | 2.15       | Responsive para tablet, accesibilidad, E2E con Playwright                                                                                                                                                                                                                                                                                                                                                  |

**Reglas compartidas con el portal** (el admin debe respetarlas exactamente):

- **Estados de participación:** PENDIENTE → EN_REVISION → APROBADA o RECHAZADA; APROBADA → PUBLICADA solo si `mostrarNombre` es true. Rechazar exige un motivo.
- **Verificación de perfil:** automática. PENDIENTE mientras el perfil está incompleto y VERIFICADO en cuanto se completa; reemplazar un documento lo mantiene VERIFICADO y editar los nombres no lo cambia. El Revisor **no verifica perfiles**: al evaluar cada opinión o propuesta coteja los documentos de identidad del autor. Ya no existe el estado RECHAZADO del perfil (28-10-2026): lo que se rechaza son las propuestas formales. No hay flujo de corrección de documentos (se quitó REQUIERE_CORRECCION).
- **Banners:** `orden` (de menor a mayor) y `vigencia` opcional `{ desde?, hasta? }`, ambas incluidas, en `AAAA-MM-DD` (día completo en hora de Venezuela) o ISO con hora. El portal solo muestra los vigentes (`src/lib/banners.ts`).
- **Catálogos y estructuras:** los catálogos están en `portal-iribarren/src/lib/api/types.ts` (CATEGORIAS de noticias v4, PARROQUIAS, CATEGORIAS_TECNICAS, OCUPACIONES, CONDICIONES_REPRESENTANTE, TIPOS_ENTIDAD, ESTADOS_*). La forma de `Participacion`, `Cuenta` y `Perfil` está en `portal-iribarren/src/lib/auth/servicio.ts`.
- **Diseño:** reutilizar los tokens del portal (`globals.css`) y adaptar el `Selector`, `Dialogo` y `CampoArchivo` del portal en lugar de crearlos de cero. El backlog pide shadcn/ui: si se usa, que tome estos tokens.
- **Sin API:** simularla igual que en el portal, con un servicio puro en memoria y sus pruebas más fixtures, para construir las pantallas sin bloquearse.

## 6.0 Admin de Iribarren (rama `feat/admin-iribarren`, 25-10-2026)

Refactorización según `Backlog_Refactorizacion_API_Admin.docx`: **una base de datos y una API por alcaldía**, y un admin por alcaldía entregado ya personalizado. Lo que sigue de la sección 6 sobre multi-alcaldía, onboarding, marca configurable, Representantes, `/plataforma` y banners **quedó como historia**. Los datos siguen simulados en `src/lib/plataforma/`, con la forma del backlog nuevo.

- **Identidad:** la del portal PDUL YA. Colores, Montserrat (títulos) y Roboto (texto) en `src/app/globals.css`; logos de PDUL YA y de la Alcaldía en `public/brand/`, copiados del portal. Lo propio del despliegue (nombre, sigla, código del folio, límites del municipio para el mapa, logos) vive en **`src/config/alcaldia.ts`**: otra alcaldía es otro despliegue con otro archivo como ese. Se conserva la estructura «Línea y estación».
- **Roles** (`src/lib/plataforma/permisos.ts`), sin membresías ni Representantes:
  - **Super Admin:** todos los permisos, con la franja «Sesión de Super Admin» en el marco. También existirá en el proyecto central de registro (otro repositorio, sin empezar y sin prioridad).
  - **Admin:** todo lo de la alcaldía (equipo, catálogos de lectura, bitácora, contenido, participaciones, ciudadanos, indicadores).
  - **Operador:** noticias, documentos, Inicio del portal y proceso; indicadores de contenido.
  - **Revisor:** participaciones y ciudadanos; indicadores de participación y ciudadanía.
- **Catálogos fijos por despliegue:** `/configuracion` es solo lectura. Las fases del proceso se editan en Contenido → Proceso.
- **Contenido** (`/contenido/*`, pestañas Noticias · Documentos · Inicio del portal · Proceso):
  - noticias con los 5 formatos, con vistas, me gusta y no me gusta en la lista;
  - documentos con versiones y descargas;
  - **Inicio del portal** (`/contenido/inicio`, `src/lib/plataforma/inicio.ts`): la tarjeta del mensaje del alcalde (una noticia de formato Texto publicada) y la tarjeta de anuncios (hasta 6 noticias publicadas, ordenables con flechas o arrastre). Si una elegida se despublica, sale de la selección y el panel avisa. El resto del Inicio es fijo o sale de los rankings;
  - **Proceso** (`/contenido/proceso`): fases y fase actual del termómetro.
  - Los banners se eliminaron.
- **Revisor, con las dos máquinas del portal** (`src/lib/plataforma/participaciones.ts`):
  - **Propuesta formal:** Pendiente o En revisión → Verificada o Rechazada (motivo y texto de 20+); Verificada → Publicada o Rechazada; Publicada → Verificada al despublicar. Se mantiene la decisión directa del 19-10-2026; el portal solo permite Pendiente → En revisión: **alinear las dos reglas con backend**.
  - **Opinión** (general o sobre noticia): sin seguimiento. Pendiente («Recibida» en el portal) ↔ Publicada.
  - Publicar exige `mostrarNombre` en los dos casos.
  - **Ubicación** de la propuesta (`ubicacion {lat, lng}`) en un mapa de solo lectura con Leaflet 1.9.4 y OpenStreetMap, con enlace a Google Maps (`src/components/revisor/mapa-ubicacion.tsx`, `src/lib/ubicacion.ts`).
  - Vistas y reacciones de los aportes publicados en el detalle. Se quitó el campo `identidad`.
- **Indicadores en `/tablero`** (`src/lib/plataforma/metricas.ts`, con pruebas): rango (7, 30, 90 días o el año, en hora de Venezuela) y exportación a CSV (`/tablero/exportar?rango=`). Cada rol ve sus secciones:
  - participación: recibidos por día o semana, por tipo, parroquia y categoría, por atender y su antigüedad, mediana de días de respuesta, tasa de verificación, opiniones publicadas, aportes con más reacciones;
  - contenido: noticias publicadas, vistas, reacciones, más vistas y más valoradas, publicadas por formato, descargas y documentos más descargados;
  - ciudadanía: registros nuevos y totales, perfiles completos, tipo de cuenta y suspendidas;
  - equipo: decisiones por persona.
  - Gráficos en SVG propio (sin librería), con tooltip por puntero y teclado, y su tabla. **Las vistas, reacciones y descargas son de demostración** (`interaccionesDemo` en `fixtures-contenido.ts`) hasta conectar la API.
- **Cuentas de demostración** (contraseña `Plataforma#2026`):

| Correo                         | Rol                                           |
| ------------------------------ | --------------------------------------------- |
| `superadmin@plataforma.test`   | Super Admin                                   |
| `admin@iribarren.test`         | Admin                                         |
| `operador@iribarren.test`      | Operador                                      |
| `revisor@iribarren.test`       | Revisor                                       |
| `equipo@iribarren.test`        | Operador y Revisor                            |
| `bloqueo@iribarren.test`       | Solo para la prueba del bloqueo               |
| `desactivado@iribarren.test`   | Cuenta desactivada                            |
| `nuevo.revisor@iribarren.test` | Invitado: `/invitacion?token=demo-invitacion` |

- **Pruebas:** Vitest (181) y Playwright: `acceso`, `accesibilidad`, `responsive`, `documentos`, `contenido`, `inicio-proceso`, `revisor` y `tablero`.
- **Pendiente:** conectar la API real (BFF con renovación del token); el proyecto central de registro; alinear con backend la regla de transiciones de la propuesta formal y el catálogo de motivos de rechazo; que el portal lea el Inicio, el proceso y los catálogos desde la API.

### Historia: el admin multi-alcaldía (hasta el 24-10-2026)

**Estado actual (ramas `feat/fundaciones-admin` → `feat/onboarding-admin`):**

- Bloques 2.1 a 2.5 hechos sobre una API simulada: acceso, roles, protección de rutas, marco del panel y tema por alcaldía.
- **Diseño «Línea y estación»**, elegido con Impeccable entre 5 direcciones:
  - Señalética del Metro de Caracas. El sidebar es una línea con una estación por sección.
  - Recorrido de estados en las tablas: lleno = completado; discontinuo = en espera, con su longitud según la antigüedad; ámbar con más de 4 días.
  - Contrato en `.impeccable/surfaces/` (no versionado), producto en `PRODUCT.md`.
- **Marca:** la neutra es la de la Plataforma de Participación Ciudadana (azul #1F3864, turquesa #17A398, Archivo; logos en `public/marca/`).
  - Dentro de una alcaldía con onboarding completo, el marco toma su color.
  - `src/lib/marca.ts` deriva `--marca`, `--sobre-marca` (blanco o tinta según el contraste), `--marca-texto` (AA sobre blanco) y `--marca-suave`.
- **API simulada:** `src/lib/plataforma/`.
  - `servicio.ts`: sesiones, bloqueo tras 5 intentos durante 15 minutos, invitaciones de 72 h (vencida, usada o reemplazada), recuperar y restablecer, cambiar la contraseña y cerrar todas, alcaldía en uso y bitácora encadenada por hash.
  - `permisos.ts`: permisos por rol, menú y permiso de cada ruta.
  - `fixtures.ts`: cuentas y alcaldías de demostración.
  - `sesion.ts`: cookie `pp_sesion` y las comprobaciones `exigirSesion`, `exigirAlcaldia`, `exigirEnAlcaldia`, `exigirPermiso` (→ `forbidden()`) y `soloInvitados`.
  - `acciones.ts`: Server Actions con `ir()`, que redirige con replace; `refresh()` al cambiar de alcaldía, porque el marco vive en el layout.
- **Protección:** `src/proxy.ts` hace una verificación optimista de la cookie. Cada página comprueba la sesión real y el permiso. `experimental.authInterrupts` da las páginas 403.
- **Cuentas de demostración** (contraseña `Plataforma#2026`):
  - `superadmin@plataforma.test`;
  - `avipri@plataforma.test` y `universitas@plataforma.test` (Representantes);
  - `admin@iribarren.test`, `operador@iribarren.test`, `revisor@iribarren.test` y `equipo@iribarren.test` (Operador y Revisor);
  - `multi@lara.test` (dos alcaldías);
  - `admin@palavecino.test` (onboarding pendiente);
  - `desactivado@iribarren.test`;
  - `admin@crespo.test`, `admin@moran.test` y `admin@urdaneta.test`: alcaldías pendientes para probar el asistente (una por tamaño en las pruebas E2E). `DELETE /api/desarrollo/onboarding/{id}` (solo desarrollo) las devuelve a «pendiente».
  - Invitaciones: `/invitacion?token=demo-invitacion` y `demo-invitacion-vencida`.
- **Pantallas:**
  - `/ingresar`, `/recuperar`, `/restablecer` e `/invitacion`;
  - `/plataforma` (alcaldías y actividad);
  - `/alcaldia` (selector);
  - `/tablero` (chips de estado, las pendientes que más esperan con su recorrido, accesos por rol);
  - `/participaciones` (bandeja de lectura con recorrido, chips de estado, búsqueda y filtros por tipo, parroquia y categoría; en el teléfono los filtros se pliegan tras «Filtros»);
  - `/onboarding` (**2.6, hecho**): asistente `?paso=logo|colores|lema|resumen` con la línea de pasos, borrador guardado en `Alcaldia.borradorMarca`, logo PNG/JPG con recorte (`react-easy-crop`, PNG de 512 px) o SVG sin recorte servido por `/logos/[id]` con CSP, colores elegidos en un espectro con barra de tono (`react-colorful`, etiquetas traducidas) o escribiendo el código, evaluados con `evaluarMarca()` (texto 4.5:1 y línea 3:1 contra blanco, con tono sugerido), lema de hasta 120 y vista previa en vivo. Las pruebas E2E devuelven cada alcaldía a «pendiente» al terminar, porque comparten el `pnpm dev` local. Al confirmar, la alcaldía queda ACTIVA, se anota en la bitácora y el marco toma color y logo.
  - 404 propia «Esta estación no existe»: dentro del panel (`(panel)/[...resto]` y `(panel)/not-found.tsx`) conserva el marco y sugiere las estaciones del usuario; fuera, con la marca neutra. 403 y 500 usan el mismo dibujo de línea cortada.
  - Esqueletos de carga con la forma de cada pantalla (`src/components/ui/esqueletos.tsx`) y `loading.tsx` en `(panel)` y `(acceso)`.
  - `/contenido/noticias` (**2.9, primera parte: noticias**): listado con chips por estado (borrador, programada, publicada, despublicada), búsqueda por título y filtros por tipo, formato, categoría, fechas y orden; tabla en escritorio y lista en el teléfono. `/contenido/noticias/[id]`: editor con los 5 formatos del portal (texto, imagen, galería, documento y video por archivo o por enlace de YouTube/Instagram, validado con las mismas reglas que `portal-iribarren/src/lib/noticias/video.ts`), portada con recorte 16:9 (1600 px), texto alternativo obligatorio, crédito y «foto ilustrativa», cuerpo en Tiptap (encabezados, negrita, cursiva, listas, cita, enlaces e imágenes) saneado en el servidor con lista blanca (`src/lib/contenido/sanear.ts`), puntos de análisis, botón opcional y «destacada en portada». Un borrador se guarda solo cada 30 s y al salir de un campo; una publicada o programada se guarda a mano y tiene que quedar completa. Publicar, programar (hora de Venezuela), volver a borrador, despublicar y eliminar el borrador (borrado lógico) piden confirmación y avisan con un toast. Las programadas vencidas se publican al leer (el «job» simulado). Los archivos suben por `POST /api/medios` con barra de progreso (firma real del archivo; imagen 5 MB, PDF 20 MB, **video 50 MB y subtítulos 200 KB: límites propios del admin, pendientes de definir con plataforma-api**) y se sirven por `/medios/[id]` solo a su alcaldía, con `Range` para el video. Las noticias de ejemplo usan fotos CC BY-SA copiadas del portal (`public/ejemplos/CREDITOS.md`). Tras cada cambio se purga la caché del navegador de las rutas de Contenido (`revalidatePath`).
  - `/contenido/banners` (**2.9, segunda parte**): carrusel del Inicio en orden, con chips por vigencia (vigente, programado, vencido; días completos en hora de Venezuela, misma regla que `portal-iribarren/src/lib/banners.ts`). Se reordena arrastrando o con «Subir»/«Bajar» y se guarda al momento (`PATCH /admin/banners/order` simulado: la lista completa o nada). `/contenido/banners/[id]` (y `/nuevo`): título, texto, botón (texto y enlace), tono del portal («rojo» = color de la alcaldía, «tinta», «cálido»), foto de fondo opcional con recorte 16:7 y crédito, y vigencia desde/hasta, con vista previa aproximada. **Decisión a confirmar:** el backlog dice que el enlace del banner es opcional, pero el tipo `Banner` del portal lo exige; el admin lo pide obligatorio.
  - `/contenido/documentos`: repositorio con chips (borrador de trabajo, oficial), búsqueda y filtros por categoría, visibilidad y fechas. `/contenido/documentos/nuevo`: PDF con progreso y ficha (título, descripción, categoría, estado, visible en el portal). `/contenido/documentos/[id]`: ficha editable (oficializar queda en la bitácora como `DOCUMENTO_OFICIALIZADO`), «Nueva versión» con PDF, nota y salto menor (1.1 → 1.2) o mayor (1.2 → 2.0), e historial como una línea donde la vigente es la estación llena; cada versión guarda su PDF (el portal solo muestra el vigente).
  - **Capa de alcaldía (2.8, 2.11, 2.12 y 2.13, rama `feat/alcaldia-revisor`):** servicio en `src/lib/plataforma/alcaldia.ts` (con pruebas), acciones en `acciones-alcaldia.ts`, datos de ejemplo en `fixtures-alcaldia.ts` y pantallas en `src/components/alcaldia/`. Cada cambio queda en la bitácora.
    - `/equipo`: miembros con estado (activo, invitación pendiente, desactivado), filtros por rol y estado, búsqueda; «Invitar» con correo y roles Operador y/o Revisor (a una cuenta existente solo se le agrega la membresía); «Gestionar» cambia roles, activa o desactiva y reenvía la invitación. Nadie se edita a sí mismo ni a un administrador. En la demo el enlace de la invitación se muestra en el diálogo.
    - `/ciudadanos`: tabla con cédula o RIF enmascarados, filtros por tipo, perfil y membresía, búsqueda por nombre, correo o 4+ dígitos de la cédula, CSV (`/ciudadanos/exportar`, también enmascarado). `/ciudadanos/[id]`: perfil completo, documentos, sus aportes y suspender o reactivar la membresía con motivo de 10+ caracteres (el Revisor ve, pero no suspende).
    - `/configuracion?pestana=marca|catalogos|fases`: marca (colores con chequeo AA, lema, logo PNG/JPG/SVG de 1 MB, vista previa); seis catálogos (agregar, renombrar sin repetir ignorando tildes, activar o desactivar); fases del proceso (agregar, editar con fechas, reordenar, marcar la actual) con vista previa del termómetro. **El portal todavía no lee estos catálogos ni fases:** se conectan con la API real.
    - `/bitacora`: eventos de la alcaldía con filtros por actor, acción, entidad y fechas, detalle `?evento=` con las diferencias antes y después, «Verificar integridad» de la cadena de hashes y CSV (`/bitacora/exportar`).
  - **Alcaldías (2.7, versión demo):** `/plataforma/alcaldias` con tabla, filtros, «Crear alcaldía» (nombre, sigla, correo del administrador; queda en onboarding con catálogos y fases de partida e invita al administrador) y ficha en `?ver=<id>` (sin ruta dinámica, por el 500 de Netlify) con conteos, administradores, suspender o reactivar y botones para entrar a operar directo en su tablero, noticias, participaciones o ciudadanos (`elegirAlcaldiaAccion` acepta `destino`). Servicio en `src/lib/plataforma/plataforma.ts`. **Flujo de demo con un solo usuario:** `superadmin@plataforma.test`.
  - Siguen anunciando su bloque: representantes y bitácora global de la plataforma.
- **Pruebas:**
  - Vitest: permisos, bloqueo, invitaciones, contraseñas, alcaldía en uso, cadena de la bitácora y contraste de marca.
  - Playwright (`pnpm test:e2e`, puerto 3001) en escritorio, tablet y 375 px: destinos por rol, 403 por rol, historial, bloqueo, invitación, cambio de marca, asistente completo, axe WCAG 2.1 AA (incluidos los pasos del asistente y la 404) y responsive sin desborde de 320 a 1920 px.

**Patrón de cada pantalla (backlog 2):**

- estados de carga, vacío y error;
- toasts;
- confirmación modal antes de acciones irreversibles;
- validación con zod antes de enviar;
- errores de la API traducidos por código a mensajes en español.

**Orden sugerido, una rama por bloque:**

| Rama                                      | Backlog    | Contenido                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat/fundaciones-admin` ✔                | 2.1–2.5    | Hecho con API simulada (ver arriba). Quedan para cuando exista la API: BFF con renovación del token, cliente orval y TanStack Query. Por ahora los avisos van en línea (`role="status"`/`alert`); toasts y DataTable completos llegan con las pantallas que los necesitan                                                                                                                                  |
| ~~`feat/fundaciones-bff`~~                | 2.1, 2.2   | BFF (route handlers proxy, cookie httpOnly, renovación del token), cliente tipado (orval) más TanStack Query, componentes base (DataTable con filtros en la URL y búsqueda con 300 ms de espera, FormField, FileUpload, ConfirmDialog, StatusBadge, EmptyState, PageHeader), toasts (sonner), middleware de rutas (sesión, onboarding, 403), tema dinámico por alcaldía                                    |
| ~~`feat/acceso-admin`~~ (incluido arriba) | 2.3, 2.4   | Login con bloqueo temporal o cuenta desactivada; aceptar invitación (token, cédula V/E, contraseña); olvidé y restablecer                                                                                                                                                                                                                                                                                  |
| ~~`feat/layout-admin`~~ (incluido arriba) | 2.5        | Sidebar según permisos, selector de alcaldía con «Operando en: X», menú de usuario, 403/404/500                                                                                                                                                                                                                                                                                                            |
| `feat/onboarding`                         | 2.6        | Asistente: logo con recorte → colores con chequeo de contraste → lema → resumen                                                                                                                                                                                                                                                                                                                            |
| `feat/contenido-operador`                 | 2.9        | Noticias (Tiptap, portada con recorte, autoguardado a los 30 s, programar, publicar, despublicar), banners (orden por arrastre, vigencia), repositorio documental (subir PDF con progreso, versiones). **Los 5 formatos de noticia del portal** (texto, imagen, galería, documento, video de archivo, YouTube o Instagram) y los campos de la v4: puntos de análisis, botón opcional, destacada en portada |
| `feat/participaciones-revisor`            | 2.10       | Bandeja (conteos por estado como filtros, filtros, búsqueda por folio, autor o cédula), detalle en dos columnas (aporte con fotos, video y soporte, y la identidad del autor con sus documentos), control de identidad, transiciones válidas, rechazo con motivo de catálogo y texto de al menos 20 caracteres, publicar o despublicar (solo con nombre autorizado), notas internas, CSV                   |
| `feat/ciudadanos`                         | 2.11       | Tabla (cédula enmascarada), detalle con documentos por URL firmada, suspender o reactivar la membresía, CSV                                                                                                                                                                                                                                                                                                |
| `feat/configuracion`                      | 2.12       | Branding, catálogos (parroquias, categorías técnicas, de noticias y de documentos, ocupaciones, tipos de organización), editor de fases y fase actual con vista previa del termómetro                                                                                                                                                                                                                      |
| `feat/plataforma`                         | 2.7, 2.8   | Alcaldías (crear, suspender, portales con `client_secret` mostrado una vez, rotar), representantes, entidades, usuarios internos (invitar con roles Operador o Revisor)                                                                                                                                                                                                                                    |
| `feat/bitacora-tablero`                   | 2.13, 2.14 | Bitácora con diferencias antes y después, verificar integridad, CSV; tablero de indicadores                                                                                                                                                                                                                                                                                                                |
| `chore/calidad-admin`                     | 2.15       | Responsive para tablet, accesibilidad, E2E con Playwright                                                                                                                                                                                                                                                                                                                                                  |

**Reglas compartidas con el portal** (el admin debe respetarlas exactamente):

- **Estados de participación:** PENDIENTE → EN_REVISION → APROBADA o RECHAZADA; APROBADA → PUBLICADA solo si `mostrarNombre` es true. Rechazar exige un motivo.
- **Verificación de perfil (decisión del 18-10-2026):** automática al completar el perfil. El Revisor **no** verifica perfiles: evalúa cada opinión o propuesta y, al hacerlo, ve los documentos de identidad del autor para cotejarlos («Identidad confirmada / No se puede confirmar»); si no lo identifican, rechaza con IDENTIDAD_NO_ACREDITADA. El portal todavía muestra los estados antiguos (pendiente de ajustar en `feat/verificacion-automatica`).
- **Catálogos y estructuras:** los catálogos están en `portal-iribarren/src/lib/api/types.ts` (CATEGORIAS de noticias v4, PARROQUIAS, CATEGORIAS_TECNICAS, OCUPACIONES, CONDICIONES_REPRESENTANTE, TIPOS_ENTIDAD, ESTADOS_*). La forma de `Participacion`, `Cuenta` y `Perfil` está en `portal-iribarren/src/lib/auth/servicio.ts`.
- **Diseño:** reutilizar los tokens del portal (`globals.css`) y adaptar el `Selector`, `Dialogo` y `CampoArchivo` del portal en lugar de crearlos de cero. El backlog pide shadcn/ui: si se usa, que tome estos tokens.
- **Sin API:** simularla igual que en el portal, con un servicio puro en memoria y sus pruebas más fixtures, para construir las pantallas sin bloquearse.

## 6.1 Demo en Netlify: sesión firmada y modo demo (19-10-2026)

- **Problema:** en Netlify cada petición puede caer en otra instancia de la función, y la sesión guardada en memoria se perdía (parpadeos y vuelta al inicio de sesión).
- **Portal:** la cookie `pdul_sesion` es un token firmado con HMAC (`SESION_SECRETO`, `src/lib/auth/token-sesion.ts`) que lleva una instantánea de la cuenta sin la contraseña. Cualquier instancia la valida y, si no conoce la cuenta o la tiene más vieja, la recrea. Cada acción que cambia la cuenta vuelve a firmar la cookie (`refrescarSesion`).
- **Admin:** el mismo token firmado en `pp_sesion` (`src/lib/plataforma/token-sesion.ts`), con la alcaldía en uso.
- **Modo demo (`DEMO=1`):** en el portal, el registro entra directo sin el paso del correo; en los dos, enlaces de recuperación en pantalla y cinta «Entorno de demostración». En desarrollo el portal sigue el flujo real para que las E2E no cambien. Se mantienen las validaciones de formato. **Endurecer al conectar la API.**
- **Sigue en memoria:** los aportes y lo que se crea en el admin pueden reiniciarse, y el portal y el admin no comparten datos. Una cuenta registrada en la demo no puede volver a iniciar sesión en otra instancia (su contraseña no viaja en la cookie).
- **Revisor (2.10) hecho en el admin**, en la rama `feat/alcaldia-revisor`: bandeja con todos los estados, detalle en dos columnas, acciones «Marcar como verificada», «Rechazar» y «Publicar en el portal» (sin cotejo de identidad, decisión del 19-10-2026), rechazo con motivo de catálogo (propuesta, por confirmar), publicar solo con nombre autorizado, notas internas y CSV.
- **Logo definitivo (20-10-2026, rama `feat/ubicacion-y-logo`):** isotipo de manzanas en turquesa, naranja y rojo; «PDUL» en azul marino y «YA» en azul. Mismos nombres en `public/brand/` (horizontal con divisor en encabezado y pie, completo con lema para Open Graph, isotipo en la 404 y en el hero sin fotos); favicon e íconos regenerados. El isotipo ya no necesita la tarjeta clara sobre fondos oscuros. La paleta de la web no cambió.
- **Ubicación del aporte (20-10-2026, rama `feat/ubicacion-y-logo`):** el formulario de participación tiene un mapa gratuito (Leaflet 1.9.4, BSD-2, sin `react-leaflet` por su licencia Hippocratic; teselas de OpenStreetMap con atribución) para marcar el punto (`src/components/cuenta/selector-ubicacion.tsx`). Alternativas: buscar dirección con Nominatim (al pulsar, máx. 1 consulta/s, limitado a Iribarren), «Mi ubicación» (geolocalización) y pegar un enlace de Google Maps (`coordenadasDeEnlace` en `src/lib/ubicacion.ts`; los cortos `maps.app.goo.gl` se resuelven en el servidor, solo dominios de Google Maps, máx. 3 saltos, `src/lib/ubicacion-acciones.ts`). Se guardan `ubicacion: { lat, lng }`, validadas dentro de un rectángulo aproximado de Iribarren; el enlace de Google Maps se arma desde las coordenadas. **Obligatoria solo en la propuesta formal.** El texto «Comunidad, barrio o sector» queda como referencia. La ubicación se ve en el detalle de «Mis participaciones» y **no se publica** (`vistaPublica` la excluye). Si el tráfico crece, cambiar el proveedor de teselas (política de uso de OSM). El admin todavía no la muestra (los datos no se comparten hasta la API).
- **Conoce el PDUL (19-10-2026):** el marco legal suma «Agenda Hábitat III y ODS» como segundo ítem. Nueva sección «Instancias y aspectos organizativos» (Alcalde, Concejo Municipal y Comisión Técnica Organizadora, art. 2 del Decreto 48-2026) entre Objetivos y «¿Qué no gestiona?»: **las competencias están en espera del texto oficial** (`INSTANCIAS` en `src/lib/conoce/contenido.ts`; al llenar `competencias` se muestran como lista).
- **Agente Ius Urbano (19-10-2026):** burbuja flotante abajo a la derecha en todas las páginas (`src/components/layout/agente-ius.tsx`, foto en `public/agentes/ius-urbano.webp`). Abre un panel tipo chat que invita a registrarse en https://iusurbano.universitas.legal/ (servicio externo de Universitas). No conversa en el portal; el texto del mensaje es una propuesta a confirmar con el cliente.
- **Logo nuevo (19-10-2026):** el portal usa la identidad oficial nueva de PDUL YA (isotipo de manzanas). Archivos en `public/brand/` con los mismos nombres; favicon e íconos regenerados desde el isotipo. La paleta de la web no cambió (el azul de «YA», `#1673B2`, no se agregó a los tokens).
- **Estado «Verificada»:** APROBADA se muestra como «Verificada» en Mis participaciones (solo cambia el texto).
- **500 en Netlify en `/propuestas/[folio]` y `/mi-cuenta/participaciones/[folio]`:** un folio no generado al compilar daba 500 (el adaptador aún no sirve el App Shell de Next 16.3+). Se generan los folios `IRI-2026-0001` a `0300` (`src/lib/folios.ts`); los de la API simulada son secuenciales.
- **Capa de alcaldía hecha en el admin** (misma rama): Equipo, Ciudadanos, Configuración (marca, catálogos y fases) y Bitácora. Los catálogos y las fases todavía no llegan al portal: se conectan con la API.
- **E2E opcionales en CI (los dos repos):** corren solo con la etiqueta `e2e` en el PR o lanzándolas a mano (_Run workflow_); los PR normales pasan solo los checks rápidos.

## 6.2 Conexión con plataforma-api (20-10-2026, rama `feat/api-auth`)

Rama aparte para probar contra la API sin tocar el despliegue de Netlify (que sigue simulado). Se activa con `API_URL` en `.env.local`; sin ella todo funciona como antes.

- **API de desarrollo:** `https://plataforma-pdul-api-693924722323.us-central1.run.app/api/v1` (Swagger en `/api/v1/docs`). `PORTAL_CLIENT_ID=portal-iribarren`; `PORTAL_CLIENT_SECRET` es opcional.
- **BFF:** el navegador nunca llama a la API. Los tokens (access de 15 min y refresh de 30 días, rotativo) van cifrados con AES-256-GCM en la cookie httpOnly `pdul_api` (`src/lib/plataforma-api/sello.ts`, secreto `SESION_SECRETO`). `src/proxy.ts` renueva el access token antes de cada página si vence en menos de 1 min (durante el render no se pueden escribir cookies) y borra la cookie si el refresh fue revocado.
- **Conectado:** ingreso (`POST /auth/login` con `x-client-id`), cierre (`/auth/logout`), cambio de contraseña (`PATCH /auth/password`), registro natural y de organización (luego inicia sesión, porque la API no devuelve tokens), perfil (`GET`/`PATCH /portal/me/profile`), documentos (`POST /portal/me/documents`) y el catálogo `organization-types` (el valor elegido se ajusta a mayúsculas del catálogo).
- **Cómo encaja:** `src/lib/auth/sesion-api.ts` lee el perfil de la API y lo copia en el almacén del portal con el mismo id (`cuentaDePerfil` en `src/lib/plataforma-api/mapeo.ts`), así «Mi cuenta», los permisos y las participaciones (todavía simuladas) no cambian. Las Server Actions llaman a `src/lib/auth/acciones-api.ts` cuando `usaApi()`.
- **Traducciones:** documentos IDENTIDAD→`CEDULA`, ENTIDAD→`ACREDITACION` (acta o registro), REPRESENTACION→`PRUEBA_REPRESENTACION`; condición y acreditación a sus enums; teléfono a `0414-1234567`; errores `{code, message, details}` a mensajes en `mensajeDeError`.
- **Sin endpoint todavía:** participaciones, noticias, documentos públicos y propuestas siguen simulados. Verificar y reenviar el correo, recuperar y restablecer la contraseña, la baja y los nombres de la persona natural ya están conectados (sección 6.6, R4).
- **Probado contra Cloud Run** con cuentas de prueba `prueba.bff.*@correo-prueba.com` y `org.bff.*@correo-prueba.com` (quedan en la base de desarrollo).

## 6.3 Campaña «Barquisimeto suena en ti», reacciones y seguimiento (22-10-2026, rama `feat/api-auth`)

- **Logo Crepuscular** (bloques en degradado rojo rosado → naranja y ámbar): mismos nombres en `public/brand/`. Favicon, `icon.png` (192 × 192, múltiplo de 48 para Google) y `apple-icon.png` regenerados.
- **Paleta de la campaña** (colores de barquisimetosuenaenti.com), cambiando los valores de los tokens en `src/app/globals.css` sin tocar componentes: `rojo` #E11D48 (CTA; blanco encima ≈ 4,7:1), `rojo-oscuro` #BE123C, `naranja` #F97316, `amarillo` #F59E0B, `noche` #2E134D (morado crepuscular: hero, pie, chat, encabezados), `tinta` #1E293B, `gris` #64748B, `superficie` #F8FAFC, `linea` #E2E8F0. Nuevos: `morado-activo` #44226E (pastilla de la página actual en el menú), `rosa` #E63956 (solo decorativo), `crema` #FDFBF7 y la utilidad `bg-marca` (degradado naranja → rosa). La barra de navegación sigue blanca porque las letras del logo son oscuras.
- **Campaña:** piezas en `public/campana/` y datos en `src/lib/campana.ts`. Tarjeta a todo el ancho en el tablero del inicio (`CampanaTile`) y `BannerCampana` (rotulado «Campaña de la Alcaldía de Iribarren») en Noticias, el detalle de cada noticia, Documentos, Propuestas y Conoce el PDUL. Enlazan a https://www.barquisimetosuenaenti.com/ en otra pestaña.
- **Ius Urbano:** sin botón; el enlace es la última burbuja del chat («Ius Urbano · iusurbano.universitas.legal»).
- **Seguimiento solo para la propuesta formal:** las opiniones (general y sobre noticia) quedan en PENDIENTE y se muestran como «Recibida», sin línea de tiempo (`tieneSeguimiento` en `src/lib/participacion.ts`; `cambiarEstadoParticipacion` responde `SIN_SEGUIMIENTO`; la galería pública solo lista propuestas formales). El filtro de estado de «Mis participaciones» aplica solo a las propuestas. **El admin todavía no aplica esta regla.**
- **Reacciones y vistas de noticias (simuladas en memoria, `src/lib/noticias/interacciones.ts`):** «Me gusta» / «No me gusta» con sesión (sin exigir perfil completo), una reacción por cuenta y noticia; repetir la quita y la contraria la reemplaza. Cada apertura de la noticia suma una vista (se cuenta desde el navegador porque la página es estática). Cifras de partida de ejemplo derivadas del slug. El inicio tiene pestañas Recientes · Más vistas · Más valoradas. **Para el backend:** `POST /portal/posts/:slug/views`, `PUT/DELETE /portal/posts/:slug/reaction` y los totales en el listado y el detalle.

## 6.4 «La gente opina» y flujo de publicación corregido (23-10-2026, rama `feat/api-auth`)

- **Flujo (corrige el del 22-10):** toda opinión y propuesta pasa al Revisor de la alcaldía, que decide si la publica en **Propuestas y opiniones** (`/propuestas`). Solo la propuesta formal tiene seguimiento con respuesta (en revisión, verificada, rechazada). La opinión queda «Recibida» (PENDIENTE) hasta que el Revisor la publica; también puede despublicarla (`TRANSICIONES_OPINION` en `src/lib/participacion.ts`). ~~Publicar exige el nombre autorizado.~~ Corregido el 28-10-2026: se publica cualquier aporte; `mostrarNombre` (pregunta Sí/No obligatoria) solo decide si aparece el nombre o «Ciudadano de Iribarren».
- **Vistas y reacciones de los aportes publicados**, con las mismas reglas que las noticias (sesión sin exigir perfil completo, una reacción por cuenta, vista por apertura). El autor no reacciona a su propio aporte. Módulo único `src/lib/interacciones/` con claves `noticia:<slug>` y `aporte:<folio>`; componente `Reacciones` en `src/components/participacion/reacciones.tsx`.
- **Inicio:** apartado «La gente opina» (`src/components/home/la-gente-opina.tsx`) con pestañas Más vistas · Más reacciones. Datos y cifras de partida de ejemplo.
- **Para el backend:** `POST /portal/participations/:folio/views`, `PUT/DELETE /portal/participations/:folio/reaction`, totales en el listado público y transición de opiniones PENDIENTE ↔ PUBLICADA en el Revisor.
- **Logo IUS:** isotipo «Catastral Verde» (bloque verde) en `public/brand/` con los mismos nombres; favicon e íconos regenerados.

## 6.5 Fase 7: Marco legal administrable y alineación entre portal y admin (26-10-2026)

Detalle para backend en `Pdull/FASE-7-ANEXO-marco-legal-y-alineacion.md`, que complementa `FASE-7-API-y-alineacion.md` y el backlog de refactorización.

- **D1 cerrada.** El Revisor puede verificar o rechazar una propuesta formal directo desde Pendiente, y rechazar una verificada. Los dos frontends usan la misma tabla de transiciones.
- **Marco legal de Conoce el PDUL, administrable** (D11, nuevo):
  - En el admin, en Contenido → Marco legal (`/contenido/marco-legal`, permiso `contenido.editar`), se pueden guardar todos los ítems que se quiera.
  - Solo los activos (10 como máximo) se ven en el portal, en el orden manual que fija el Operador.
  - Cada ítem tiene título, descripción y un botón opcional a una noticia publicada o a un documento público. El texto del botón es editable, con valor por defecto: «Leer la noticia» o «Ver el documento».
  - Si el destino se despublica, el portal oculta el botón y el admin muestra un aviso.
  - El portal lo lee con `getMarcoLegal()`, con la forma de `GET /portal/legal-framework`.
- **Vista previa antes de publicar en el admin:**
  - noticias: ya existía;
  - proceso: el termómetro, ya existía;
  - **Inicio y Tarjeta de transiciones**: el mensaje del alcalde y la tarjeta con sus diapositivas, que se puede recorrer como en el portal;
  - **documentos**: la fila del repositorio, en vivo, al subir o editar la ficha;
  - **Marco legal**: el ítem, en vivo, mientras se edita, y la sección completa en un diálogo.
- **«Recibida»:** el admin muestra así las opiniones pendientes, como el portal.
- **Portal sin membresías:**
  - se quitaron `/unirme`, «Abandonar este portal», el aviso de abandono en el ingreso y el campo `membresias` de la cuenta simulada;
  - la solicitud de baja se mantiene;
  - la traducción de `MEMBERSHIP_*` en `src/lib/plataforma-api/mapeo.ts` sigue mientras la API no los retire.
- **Inicio (D12): solo dos tarjetas editables.**
  - El mensaje del alcalde: una noticia de texto, que el portal lee con `getHome()` (forma de `GET /portal/home`). Mientras no haya una elegida, muestra el texto provisional (D10 sigue abierta).
  - La tarjeta con transiciones bajo el termómetro: **tiene sus propias diapositivas** (título, texto, botón, tono o foto, orden y vigencia), no noticias elegidas.
    - En el admin se editan en Contenido → Tarjeta de transiciones (`/contenido/banners`), con la vista previa idéntica a la del portal.
    - El portal muestra las 6 primeras vigentes (`getBanners()`, forma de `GET /portal/banners`).
  - Se descartó la idea de «anuncios con noticias».
- **Ramas:** `portal-iribarren` en `feat/alineacion-fase-7` (sale de `main`); `plataforma-admin` en `feat/marco-legal-y-alineacion` (sale de `feat/admin-iribarren`, que aún no está en `main`).
- **Todavía sin API:** cada repo tiene sus datos simulados, así que lo que se guarda en el admin no se ve en el portal hasta conectar los dos a la API.

## 6.6 R2, R4 y R5a de plataforma-api: autenticación, cuentas con correo real e IP del ciudadano (26 y 27-10-2026, rama `feat/api-r2-autenticacion`)

Con la API en la rama `dev` (R2, guía `FRONTEND_R2_AUTENTICACION.md` del backend):

- **Contraseña actual incorrecta** en `PATCH /auth/password`: ahora `401 INVALID_PASSWORD` (antes `INVALID_CREDENTIALS`, que queda solo para el login). `cambiarContrasenaApi` lo pone bajo el campo «Contraseña actual»; `VALIDATION_ERROR` va bajo «Contraseña nueva».
- **Errores retirados por la API:** `MEMBERSHIP_REQUIRED`, `MEMBERSHIP_SUSPENDED` y `TENANT_SUSPENDED` salen de `mensajeDeError`. Una cuenta suspendida llega como `403 ACCOUNT_DISABLED`.
- **`user` del login, del refresh y de `GET /auth/me`:** sin `membership`; trae `context`, `roles`, `permisos`, `cuenta {estado, desde, motivo}` y `alcaldia {codigo, nombre}` (`ResumenUsuarioApi` en `cliente.ts`). El portal solo usa `perfilEstado`.
- **Cerrar sesión en todos los dispositivos** (Mi cuenta → Seguridad): `POST /auth/sessions/revoke-all` → `204`. La API revoca todos los refresh tokens, también el de esta sesión; el portal borra su cookie siempre y lleva a `/ingresar?aviso=sesiones`. En modo simulado, `cerrarTodasLasSesiones` hace lo mismo con el almacén.
- `POST /auth/logout` responde `204` sin cuerpo; `pedirApi` ya lo admitía. `pedirApi` acepta además `PUT` y `DELETE` para los módulos siguientes (orden del Marco legal, borrados).
- **R4, cuentas con correo real (urgente en producción):** la API envía los correos (Resend, «PDUL YA Iribarren») y exige verificar el correo para entrar. Conectados:
  - `/verificar` → `POST /portal/auth/verify` (`{estado, email?}`; el correo solo con `VENCIDO`, para «pedir otro enlace»);
  - el registro → `{verificacionPendiente}`: guarda el aviso y va a «Revisa tu correo». Responde igual aunque el correo exista, así que `IDENTITY_CONFLICT` ya solo llega por cédula o RIF;
  - reenviar (`/resend`) y olvidé (`/forgot`), neutros con `204`;
  - `/restablecer` consulta `POST /portal/auth/reset/estado` sin gastar el enlace, y `POST /portal/auth/reset` cierra todas las sesiones (`INVALID_TOKEN` con `details.estado`);
  - baja → `POST /portal/me/deletion-request` (idempotente; se sigue entrando);
  - nombres de la persona natural en `PATCH /portal/me/profile`;
  - el perfil trae `verificacion` y `verificacionMotivo` (el portal ya no los usa: no hay perfiles rechazados) y `bajaSolicitada`.
  - En local, con `EXPONER_ENLACES_DESARROLLO=true` y `PORTAL_URL` en la API, las respuestas traen `enlaceDesarrollo` y `AvisoDesarrollo` lo muestra.
- **R5a, IP del ciudadano:** la API limita login, registro, verificar, reenviar, olvidé y restablecer (`429 TOO_MANY_REQUESTS`, ya traducido). `pedirApi` reenvía `x-client-ip` (de `x-nf-client-connection-ip` o `x-forwarded-for`) **solo junto con `x-client-secret`**, que es la única forma en que la API la acepta.
- **Netlify (pdulya.com):** `API_URL`, `PORTAL_CLIENT_ID=portal-iribarren` y `PORTAL_CLIENT_SECRET` = el secreto `pdul-iri-portal-secret` de GCP (pedirlo por canal privado). Sin el secreto, todos los ciudadanos comparten la IP de Netlify; uno equivocado hace que la API rechace todo `/portal/*` con `401 INVALID_PORTAL_CREDENTIALS`.
- **Términos y política de datos:** la API guarda la versión aceptada (`2026-10-17`). Si cambia el texto de `/terminos` o `/politica-de-datos`, hay que avisar a backend para subir la versión.
- **El admin no cambia todavía:** no se conecta a la API. Cuando lo haga, entra sin `x-client-id` (contexto `admin`) y `user.permisos` manda sobre `permisosDe`.

## 6.7 R8 de plataforma-api: repositorio de documentos (28-10-2026, rama `feat/api-r8-documentos`)

Guía `docs/frontend/FRONTEND_R8_DOCUMENTOS.md` de la API. Con `API_URL`, el repositorio sale de la API; sin ella, de los datos de ejemplo.

- **Lecturas** (`src/lib/api/index.ts`, con `publica: true` como las noticias):
  - `getDocumentos` → `GET /portal/documents?q&categoria&estado&page`, 10 por página;
  - `paginaDeDocumentosApi` (`src/lib/documentos/consultas.ts`) la pasa a `PaginaDocumentos`, con `meta.porCategoria` y `meta.porEstado`;
  - `getDocumento` → `GET /portal/documents/:slug`; un documento oculto o eliminado da 404;
  - `getDocumentoSlugs` recorre `?limit=100&page=N` para el detalle y el sitemap. `generateStaticParams` nunca queda vacío.
- **Descargas contadas:** «Descargar» (fila del listado) y «Abrir» y «Descargar» (detalle) van a `descargaUrl` (`…/portal/documents/<slug>/download`). Cuenta una vez por visitante y documento cada 30 minutos. El visor embebido sigue con `archivo.url`, que no cuenta. Los adjuntos de las noticias no cambian.
- **Texto «Documento de ejemplo, sin validez oficial»:** solo sin la API.
- **Categorías:** el catálogo `categorias-documentos` de la API coincide con `DOC_CATEGORIAS`.
- **Datos reales:** el Decreto N° 48-2026 ya está en producción con el slug `decreto-48-2026`.

## 6.8 Sesión por inactividad, R9 y Conoce el PDUL por secciones (28-10-2026, rama `feat/sesion-r9-conoce`)

**Sesión (decisión de Frank: se cierra a los 15 minutos sin usar el portal).** Antes, al vencer, el encabezado seguía con el nombre hasta recargar (el layout no se vuelve a pedir al navegar).

- **Por qué se cerraba sola:** el refresh token rota y la API revoca toda la sesión si uno se usa dos veces (`REFRESH_TOKEN_REUSED`). Al navegar, la página y los prefetch salían a la vez con la misma cookie y todas renovaban.
- **`renovacion.ts`** (`revisarCookie`, usado por `src/proxy.ts`):
  - cierra la sesión tras 15 minutos sin actividad (`SESION_INACTIVIDAD_MIN`; se lee al compilar el layout, así que cambiarla pide volver a desplegar);
  - los prefetch no renuevan ni cuentan como actividad;
  - las renovaciones simultáneas comparten una sola llamada a `/auth/refresh` (recordada 30 s);
  - la última actividad viaja en la cookie (`v`) y se reescribe como mucho una vez por minuto.
- **`GET /api/sesion`** responde `{ conSesion }`. Como pasa por Proxy, también renueva y anota la actividad.
- **`VigiaSesion`** (layout) consulta `/api/sesion` al usar la página (cada 4 min como mucho), al volver a la pestaña, al cambiar de ruta y al cumplirse el plazo. Si la sesión se cerró, refresca o lleva a `/ingresar?aviso=inactividad`, que muestra el aviso.
- **Comprobado contra la API local** (access de 90 s, inactividad de 2 min): sin actividad, cierra y avisa; navegando cada 50 s, la sesión sigue más de 4 min sin ninguna `SESSION_REVOKED` nueva en la bitácora.
- En una página pública, el encabezado pasa a «Iniciar sesión» solo; en `/mi-cuenta` o `/participa` (`RUTAS_PRIVADAS`), lleva a ingresar.

**R9, Marco legal** (guía `FRONTEND_R9_MARCO_LEGAL.md`): `getMarcoLegal()` lee `GET /portal/legal-framework` con `cacheLife("minutes")`. Llega en orden, hasta 10, y con el botón solo si su destino sigue publicado. Sin la API, `MARCO`.

**Conoce el PDUL, una sección a la vez:** el índice muestra solo la elegida (por defecto «¿Qué es un PDUL?») y la deja en la URL (`#marco-legal`), así funcionan los enlaces del pie y «Atrás». CSS en `globals.css` (`.secciones-conoce`, con `:target` antes de que cargue el índice); el foco va al título de la sección.

## 7. Noticias reales (Propuesta v4), ya cargadas

| Slug                                    | Fecha | Categoría               | Formato                                            |
| --------------------------------------- | ----- | ----------------------- | -------------------------------------------------- |
| `gaceta-5256-decreto-48-2026`           | 11-09 | Normativa               | Documento (Gaceta en el visor y botón de descarga) |
| `decreto-inicio-pdul-iribarren`         | 14-09 | Análisis institucional  | Imagen                                             |
| `anuncio-decreto-48-aniversario`        | 14-09 | Decretos y normativas   | Galería (sesión solemne)                           |
| `tres-compromisos-alcalde-pdul`         | 15-09 | Mensaje institucional   | Video de archivo                                   |
| `no-se-trata-de-improvisar-hcamp`       | 16-09 | Despliegue territorial  | Imagen ilustrativa                                 |
| `marco-jurisprudencial-pdul`            | 18-09 | Doctrina legal          | Imagen ilustrativa                                 |
| `primera-mesa-tecnica-concejo-alcaldia` | 22-09 | Mesas de trabajo        | Texto (destacada)                                  |
| `reunion-auditoria-legal-institucional` | 03-10 | Auditoría y diagnóstico | Galería (destacada)                                |
| `vision-de-futuro-conversacion-publica` | 04-10 | Visión de futuro        | Imagen (destacada)                                 |

El PDF de la Gaceta también es el documento `decreto-48-2026` del repositorio, al que enlazan Conoce y el pie de página.

## 8. Contrato supuesto con plataforma-api (revisar con backend)

Lo que las pantallas del portal dan por hecho. Las rutas siguen el backlog 1.4, 1.11 y 1.16.

| Uso                     | Método y ruta                                                                                           | Notas                                                                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registro                | `POST /portal/auth/register`                                                                            | Responde 202 neutro aunque el correo exista; 409 `IDENTITY_CONFLICT` si la cédula o el RIF ya tienen otro correo                                                                                                                    |
| Verificar o reenviar    | `POST /portal/auth/verify`, `POST /portal/auth/resend`                                                  | Token de un uso, 24 h; estados OK, VENCIDO, USADO e INVALIDO                                                                                                                                                                        |
| Login                   | `POST /portal/auth/login`                                                                               | 401 si las credenciales no son válidas; 403 `EMAIL_NOT_VERIFIED`; `NO_MEMBERSHIP` lleva a «unirse»                                                                                                                                  |
| Unirse                  | `POST /portal/membership`                                                                               | Crea la membresía en la alcaldía                                                                                                                                                                                                    |
| Recuperar o restablecer | `POST /portal/auth/forgot`, `POST /portal/auth/reset`                                                   | Neutro; token de 1 h; restablecer cierra todas las sesiones                                                                                                                                                                         |
| Cambiar contraseña      | `POST /portal/auth/password/change` (**no está en el backlog: pedir a backend**)                        | `{ actual, nueva }` → 204; 401 `INVALID_PASSWORD` si la actual no coincide; revoca las demás sesiones                                                                                                                               |
| Perfil                  | `GET` / `PUT /portal/perfil` (backlog: `PATCH /portal/me/profile`)                                      | Nombres y apellidos (persona natural), teléfono y ocupación; en organizaciones, condición, representante, cédula, teléfono institucional y acreditación                                                                             |
| Documentos              | `POST /portal/perfil/documentos`                                                                        | IDENTIDAD, REPRESENTACION o ENTIDAD; PDF, JPG o PNG de 2 MB; cada carga sube la versión; con el perfil completo queda VERIFICADO                                                                                                    |
| Abandonar o baja        | `DELETE /portal/membresia`, `POST /portal/cuenta/baja`                                                  |                                                                                                                                                                                                                                     |
| Participar              | `POST /portal/participaciones`                                                                          | Cabecera `Idempotency-Key`. Campos: tipo, noticia, parroquia, sector, categoría técnica, descripción (50–3000), hasta 5 fotos, video (enlace YouTube o Instagram), soporte y `mostrarNombre`. Responde con el folio `IRI-AAAA-XXXX` |
| Mis participaciones     | `GET /portal/participaciones?estado&tipo&folio` y `GET /portal/participaciones/{folio}`                 | Con el historial de estados y comentarios                                                                                                                                                                                           |
| Galería pública         | `GET /portal/propuestas?q&tipo&parroquia&categoriaTecnica&pagina` y `GET /portal/propuestas/{folio}`    | Toda PUBLICADA; autor «Ciudadano de Iribarren» si no autorizó su nombre; `q` no busca en ese nombre; sin datos personales                                                                                                           |
| Contenido               | `GET /portal/posts`, `/portal/posts/{slug}`, `/portal/banners`, `/portal/documentos`, `/portal/proceso` | Con las formas de `src/lib/api/types.ts`. Lo ideal es que `/portal/banners` ya filtre por vigencia y ordene; el portal lo hace igual por si acaso                                                                                   |

- **Textos legales (R15, 29-10-2026):** los términos de uso y la política de datos se leen en un modal al registrarse y se guarda la versión aceptada. Un Administrador publica versiones nuevas desde el admin; con una versión pendiente, la cuenta queda bloqueada por un modal (aceptar o cerrar sesión) y las acciones que escriben devuelven error. Sin la API: contenido provisional en `src/lib/mocks/textos-legales.ts` y la ruta de desarrollo `/api/desarrollo/textos-legales`. Contrato para backend: `Downloads/R15_TEXTOS_LEGALES.md`.
