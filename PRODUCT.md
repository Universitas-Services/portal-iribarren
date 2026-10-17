# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos audiencias con el mismo peso:

- **Vecinos de Iribarren** (Barquisimeto, estado Lara) que quieren informarse del nuevo plan urbano y opinar o proponer sobre su barrio. Entran sobre todo desde el teléfono, a menudo con datos limitados.
- **Actores organizados** convocados por el Art. 7 del Decreto 48-2026: Poder Popular (comunas, consejos comunales, CTU, mesas técnicas), gremios técnicos y profesionales, sector académico (UCLA, UPTAEB, UNEXPO, UFT, UNEFA, UBV…) y sector económico (cámaras, PyMEs, COMDIBAR). Actúan mediante un vocero y suelen preparar propuestas formales con documentos de soporte.

Trabajo que vienen a hacer: entender en qué etapa está el PDUL, consultar noticias y documentos oficiales, registrarse y enviar opiniones o propuestas con trazabilidad (folio) y seguir su respuesta.

## Product Purpose

PDUL YA es el portal oficial de la Alcaldía Bolivariana de Iribarren para el proceso del Plan de Desarrollo Urbano Local (PDUL): difunde avances, centraliza el repositorio documental y recibe opiniones y propuestas ciudadanas con acuse, folio único (IRI-2026-XXXX), estados y respuesta motivada. El portal es exclusivo del PDUL; los trámites urbanos (permisos, zonificación, variables urbanas) siguen en la DPCU y no se procesan aquí.

Éxito: que vecinos y organizaciones participen de forma informada y verificable antes y durante la consulta pública, y que la alcaldía cuente con un registro auditable de esos aportes.

## Positioning

Canal oficial y trazable del PDUL de Iribarren: cada aporte recibe folio inalterable, pasa por una máquina de estados visible para su autor y queda en bitácora auditable bajo parámetros de la OAC/CGR. Supera la ultra-actividad del PDUL 2003 con una planificación participativa, moderna y con rigor técnico (Decreto 48-2026). La plataforma es la primera instancia de un sistema replicable a otras alcaldías.

## Operating Context

Fases oficiales del proceso (termómetro del portal, en este orden):

1. Decreto del alcalde
2. Aprobación del plan de trabajo
3. Diagnóstico
4. Formulación
5. Consulta pública (60 días)
6. Aprobación en Cámara
7. Vigencia

La recepción de propuestas está abierta antes de la consulta pública formal (ventana prevista de 12 meses). Participación: el ciudadano se registra, verifica su correo, completa su perfil (documento de identidad; si es vocero, RIF y acta o carta aval) y desde ese momento puede opinar y proponer; el Revisor confirma la identidad al evaluar cada propuesta. Las publicaciones de la Alcaldía (noticias y banners) llegan en cinco formatos: texto, una imagen, galería, documento adjunto o video (archivo subido o enlace de YouTube). Tipos de aporte: opinión general, opinión sobre una noticia y propuesta formal con adjunto. Parroquias del catálogo (10, según la Propuesta de Gestión Ciudadana v3): Concepción, Catedral, El Cují, Tamaca, Ana Soto, Santa Rosa, Unión, Juárez, Buena Vista y Águedo Felipe Alvarado. Categorías técnicas: Zonificación y Uso de Suelo; Servicios Públicos y Redes; Vialidad y Transporte; Equipamiento Urbano; Medio Ambiente y Riesgos; Patrimonio y Renovación Urbana.

## Capabilities and Constraints

- Next.js 16 (App Router) + TypeScript + Tailwind 4; la API (NestJS) la construye otro equipo y aún no existe: el portal usa datos de ejemplo detrás de `src/lib/api/`.
- **Todas las páginas deben ser altamente responsive**, mobile-first y livianas para conexiones comunitarias.
- Archivos ciudadanos: PDF, JPG o PNG de hasta 2 MB.
- **Cuentas (v3):** persona natural se registra con cédula, nombres, apellidos, correo y contraseña; el teléfono, la ocupación y el documento de identidad se piden al completar el perfil. La organización se registra con tipo de entidad, razón social, RIF, correo institucional y contraseña (sin cédula); los datos y la acreditación del representante llegan al completar el perfil. Correo y RIF únicos; la cédula del representante es un dato del perfil, no un identificador de cuenta. Ambas cuentas usan membresías por alcaldía.
- **Perfil y participación:** se participa con el perfil COMPLETO (no hace falta esperar a «Verificado»); el estado de verificación se muestra y solo «Rechazado» bloquea el envío. Con «Requiere corrección» únicamente se reemplaza el documento señalado y el perfil vuelve a «Pendiente». Las organizaciones participan solo desde su propia cuenta: no hay vínculo persona-organización ni selector «actuar como». Cada envío lleva una Idempotency-Key, así que un doble clic no crea dos folios (`IRI-AAAA-XXXX`).
- **Estados de carga obligatorios:** toda página nueva lleva su `loading.tsx` con un skeleton de la misma forma que el contenido, y los bloques con datos se envuelven en `<Suspense>` con su propio skeleton. Las rutas inexistentes y los fallos usan los compartidos `src/app/not-found.tsx` y `src/app/error.tsx`.
- Pendiente por confirmar: fase actual del proceso (dato configurable desde el admin), dominio definitivo, enlaces oficiales a la Ordenanza de Gobierno Electrónico y a la LOOU.

## Brand Commitments

- Nombre: **PDUL YA** — «Planificación Urbana Participativa para la Ciudad Humana».
- Frase de marca: «La ciudad que planificamos juntos».
- Titular rector: «PDUL YA: Construyendo la Barquisimeto del Futuro, Humana y Sostenible».
- Marcas institucionales y de gestión que deben convivir: Alcaldía Bolivariana de Iribarren (escudo), Yanys Agüero — Alcalde, «Iribarren para la Vida», «Gente que Resuelve», «Pensar en grande».
- Voz: una mezcla de institucional y cercano con energía de campaña; trato de tú al vecino, serio y confiable, sin jerga técnica innecesaria, con la voz de la gestión presente.
- Paleta y tipografía institucionales fijadas por el cliente en la Guía de Identidad Urbana PDUL YA (vinculantes).
- Valores: Ciudadanía (participación activa y corresponsable), Planificación (orden, desarrollo y sostenibilidad), Transparencia (gestión abierta y confiable). Personalidad: institucional, participativa, técnica, cercana, transparente.

## Evidence on Hand

- Logos oficiales PDUL YA (isotipo, horizontal, horizontal con divisor, vertical, lámina) y logo de la Alcaldía de Iribarren (`alcaldia-iribarren.png`, texto gris oscuro: solo sobre fondo claro; va en el footer, lado derecho): `public/brand/`.
- Guía de identidad y lineamientos: `C:\Users\unive\Downloads\para iribarren portal\` (Guía de Identidad Urbana PDUL YA.png, propuesta visual.pdf, Propuesta Gestión Ciudadana PDUL YA (2).pdf).
- Foto del hero: «Santa Iglesia Catedral Metropolitana, Catedral de Barquisimeto», Rube96pinto, CC BY-SA 4.0 (Wikimedia Commons), en `public/fotos/catedral-metropolitana.jpg`; exige crédito visible con autor, licencia y fuente. Se reemplaza cuando la Alcaldía entregue fotos propias.
- Propuesta de Gestión Ciudadana v3 (`Downloads/Propuesta Gestión Ciudadana PDUL YA (3).pdf`): fases con su estado, noticias reales con «puntos de análisis», antecedentes legales (Ordenanza 2003, Sentencias TSJ 928/2018 y 0171/2021, Decreto 48-2026) y lineamientos de marca. Sus fotos están en Google Drive con acceso restringido; mientras tanto esas noticias usan fotos libres de Commons rotuladas «Foto ilustrativa».
- Ausentes (no inventar): logos de Yanys Agüero, Iribarren para la Vida y Gente que Resuelve (espacios reservados hasta recibirlos); mensaje textual del alcalde; noticias, documentos y cifras reales. Los datos actuales son de ejemplo y deben verse como tales.

## Product Principles

1. **Trazabilidad visible:** todo aporte muestra su folio, estado y respuesta; nada se edita después de enviado.
2. **Participar es fácil desde el teléfono:** el camino de informarse a proponer se recorre en pocos pasos y con poca data.
3. **Oficial y cercano a la vez:** la autoridad institucional no aleja al vecino; se explica sin jerga.
4. **Solo el PDUL:** lo que no es del plan se deriva a la DPCU; no se mezcla.
5. **Replicable:** lo que se construye para Iribarren debe poder vestirse con otra marca.

## Accessibility & Inclusion

WCAG 2.1 AA en el portal; uso con teclado; respeto de `prefers-reduced-motion`; textos claros para personas con distinta alfabetización digital.
