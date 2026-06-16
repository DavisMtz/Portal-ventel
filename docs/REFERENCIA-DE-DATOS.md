# 🗃️ Referencia de datos del Portal Ventel

> Documento técnico. Detalla **cada hoja de cálculo** que alimenta el portal, sus
> columnas, los formatos JSON de los anuncios y las reglas de visibilidad. Útil
> para quien administra los datos o da mantenimiento al backend (`coge.gs`).

---

## 1. Principio general

Toda la información del portal vive en **una hoja de cálculo de Google Sheets**
(la que tiene el script `coge.gs` adjunto). Cada pestaña (hoja) es una “tabla”.

Reglas comunes a casi todas las hojas:
- La **primera fila** son los encabezados (títulos de columna).
- Las columnas se detectan por **alias** (el encabezado debe *contener* la
  palabra clave; no importan mayúsculas/acentos ni el orden de las columnas).
- Cada hoja tiene una **columna requerida**: si una fila la tiene vacía, se
  **omite** (sirve para ignorar filas en blanco).

A continuación, para cada hoja: columnas reales, alias aceptados por el código,
columna requerida y cómo se usa en el portal.

---

## 2. Hoja `Herramientas`

Plataformas y sistemas del equipo (sección **Herramientas**).

| Columna | Alias aceptados | Uso |
|---|---|---|
| Nombre *(requerida)* | `nombre` | Título de la tarjeta |
| Enlace | `enlace`, `liga`, `link`, `url` | Botón de acceso |
| Como acceder | `acceder`, `acceso`, `como` | Instrucción de acceso |
| Descripcion | `descrip` | Descripción |
| Claves | `clave` | Claves/credenciales mostradas |

---

## 3. Hoja `Presentaciones`

Material de apoyo (sección **Presentaciones**).

| Columna | Alias | Uso |
|---|---|---|
| Nombre *(requerida)* | `nombre` | Título |
| LIGA | `liga`, `enlace`, `link`, `url` | Enlace |
| DESCRIPCION | `descrip` | Descripción |

---

## 4. Hoja `Paqueterias`

Paqueterías y su código en el sistema **SOMS** (sección **Paqueterías**).

| Columna | Alias | Uso |
|---|---|---|
| Nombre *(requerida)* | `nombre` | Nombre de la paquetería |
| Liga | `liga`, `enlace`, `link`, `url` | Portal de rastreo |
| Soms | `soms`, `sistema` | Cómo aparece en SOMS |

---

## 5. Hoja `Formatos`

Documentos y formularios operativos (sección **Formatos**).

| Columna | Alias | Uso |
|---|---|---|
| ACCESO *(requerida)* | `acceso`, `nombre`, `formato` | Nombre del formato |
| OBSERVACIONES | `observ`, `nota` | Notas importantes |
| LIGA | `liga`, `enlace`, `link` | Enlace al documento |

---

## 6. Hoja `PdePago`

Promociones de pago web (sección **Pago Web**).

| Columna | Alias | Uso |
|---|---|---|
| Nombre *(requerida)* | `nombre` | Título |
| Detalles | `detalle`, `descrip`, `info` | Explicación |
| Liga | `liga`, `enlace`, `link`, `url`, `simulad` | Simulador/enlace |

---

## 7. Hoja `Plantillas`

Plantillas de correo y Salesforce (sección **Plantillas**).

| Columna | Alias | Uso |
|---|---|---|
| ID | `id` (exacto) | Lo gestiona el constructor; el portal lo **ignora** |
| Titulo *(requerida)* | `titulo`, `título`, `nombre`, `plantilla` | Título |
| Tipo | `tipo` | `Correo` o `Sales Force` |
| Asunto | `asunto`, `subject` | Solo aplica a `Correo` |
| Cuerpo | `cuerpo`, `body`, `mensaje`, `texto`, `contenido` | Texto principal |
| Consideraciones | `consider`, `nota`, `escalam`, `copia`, `observ` | Notas y correos de copia/escalamiento |

**Reglas de interpretación:**
- **Tipo `Correo`** → usa Asunto + Cuerpo + Consideraciones.
- **Tipo `Sales Force`** → usa solo Cuerpo + Consideraciones (Asunto se ignora).
  El tipo se normaliza: cualquier valor que coincida con `sales`/`force`/`sf` se
  trata como *Sales Force*; todo lo demás, como *Correo*.
- En el **Cuerpo**, cualquier fragmento entre corchetes `[ así ]` se convierte en
  un **campo editable** en la tarjeta; el texto de adentro es el *placeholder*.
  Al copiar, se reemplaza por lo que escriba el asesor (si lo deja vacío, se
  conserva `[la pista]`).
- En **Consideraciones**, el portal detecta automáticamente correos electrónicos
  y los ofrece como chips para copiarlos (copia obligatoria / escalamiento).

> La columna `ID` la administra `ConstructorPlantillas.html`. Si la hoja se creó
> a mano sin ella, `ensurePlantillaIdCol_()` la inserta al inicio.

---

## 8. Hoja `Anuncios`

Publicaciones del equipo en formato **JSON** (sección **Inicio**). La administra
el sidebar `Constructor.html`.

**Columnas:** `ID | Formato | Activo | Orden | Desde | Hasta | Datos (JSON) | Autor | Creado`

| Columna | Alias | Uso |
|---|---|---|
| ID | `id` | Identificador único (upsert) |
| Formato | `formato` | `banner`, `destacado`, `tarjeta` o `modal` |
| Activo | `activo` | Visibilidad (ver reglas abajo) |
| Orden | `orden` | Orden ascendente de aparición |
| Desde | `desde`, `inicio` | Fecha de **inicio** (programación) |
| Hasta | `hasta`, `vigen`, `fecha` | Fecha de **fin** (vigencia) |
| Datos (JSON) | `dato`, `json` | Contenido propio del formato (ver §10) |
| Autor | `autor` | Correo de quien publicó |
| Creado | `creado`, `creacion` | Fecha de creación |

**Reglas de visibilidad** (`readAnuncios_`):
- `Activo` es **verdadero** si la celda está vacía, o vale `true`, `si`, `sí`,
  `1`, `x` o `activo` (`esActivo_`). De lo contrario, oculto.
- `Desde` en el futuro → **programado**, aún no se muestra.
- `Hasta` se considera **inclusivo de todo ese día**: un anuncio expira solo
  cuando su fecha cae en un día **anterior a hoy** (comparado contra el inicio del
  día actual, `hoy0`).
- Solo se muestran formatos válidos; se ordenan por `Orden` ascendente.

**Estados en el sidebar** (`getAnunciosAdmin`): `activo`, `inactivo`,
`programado`, `expirado`.

> `ensureDesdeCol_()` agrega la columna `Desde` al final si la hoja se creó antes
> de existir la programación, para no romper hojas antiguas.

---

## 9. Hoja `Avisos` (legacy / compatibilidad)

Hoja antigua de avisos. Se sigue leyendo para **no perder publicaciones previas**;
cada fila se convierte en un anuncio de formato `banner`.

| Columna | Alias | Uso |
|---|---|---|
| Mensaje *(requerida)* | `mensaje`, `aviso`, `texto` | Texto del banner |
| Tipo | `tipo` | Tono (`info`, `warn`, `alert`, `ok`) |
| Hasta | `hasta`, `vigen`, `fecha` | Vigencia |

Para compatibilidad con cachés viejas del cliente, `buildToolsData_` también
expone `avisos` = los anuncios de formato `banner` mapeados a `{ mensaje, tipo }`.

---

## 10. Formatos de anuncio (campo `Datos (JSON)`)

La columna **Datos (JSON)** guarda un objeto JSON cuyo contenido depende del
`Formato`. Estos son los cuatro tipos (`ANUNCIOS_FORMATOS`):

- **`banner`** — Aviso de texto descartable.
  - `tono`: `info` | `warn` | `alert` | `ok`
  - `mensaje`: texto del aviso

- **`destacado`** — Tarjeta fija no descartable al inicio.
  - `titulo`, `cuerpo`, y opcionalmente texto + enlace de un botón (CTA).

- **`tarjeta`** — Publicación visual con imagen.
  - imagen (URL en Drive), descripción, vigencia y botón de enlace (CTA).

- **`modal`** — Pop-up de bienvenida que aparece una vez por sesión.

> El esquema exacto de cada formato lo define `Constructor.html` (el constructor),
> que es quien escribe el JSON. El backend solo valida el `Formato` y hace
> `JSON.parse` del contenido; lo fusiona con `{ id, formato, orden }` y lo entrega
> al cliente, que lo renderiza según el formato.

**Imágenes de anuncios:** `subirImagenAnuncio()` recibe la imagen como
`data:URL` base64, la decodifica, valida que sea imagen y ≤ 8 MB, la guarda en la
carpeta de Drive **“Portal Ventel”** (`ANUNCIOS_FOLDER`), la comparte como
*cualquiera con el enlace · ver* y devuelve una URL de tipo
`https://drive.google.com/thumbnail?id=...&sz=w1200`.

---

## 11. Hoja `Promociones`

Promociones de Liverpool (página **Monitor de Promociones**). Lectura específica
en `buildApplicationData_` (no usa `readSheet_`).

| Columna (contiene) | Campo de salida |
|---|---|
| `direcci`(on) | `direccion` |
| `banner / carrusel` | `categoria` |
| `promoción 2026` (o `desc mkp`) | `promocion` |
| `marca` | `marca` |
| `vigencia` | `vigencia` |
| `liga` | `liga` |

Se omiten filas sin dirección y sin banner. `origen` = `"Promociones"`.

---

## 12. Hoja `MKP` (Marketplace)

Promociones de Marketplace (se mezclan con las anteriores en el monitor).

| Columna (contiene) | Campo de salida |
|---|---|
| `direcci`(on) | `direccion` |
| `banner / carrusel` | `categoria` |
| `promoción mktplace` (o `promoción`/`promocion`) | `promocion` |
| `vigencia` | `vigencia` |
| `liga` | `liga` |

`origen` = `"Marketplace"`, `marca` = `"Marketplace"`.

**Interpretación de vigencia** (`parseVigencia_`): entiende textos en español
como *“3 al 15 de junio”*, *“10 de mayo”*, con rangos y meses abreviados
(`monthIdx_`). Con eso, `fetchPromoCounts()` calcula cuántas promos están
**activas** hoy y cuántas terminan en **≤ 3 días**.

---

## 13. Google Calendar (eventos)

Además de las hojas, el monitor lee eventos de un **Google Calendar** fijo:

- ID: `liverpool.com.mx_7vl69nu0ep7fp5mkn36bjejheg@group.calendar.google.com`
- Ventana: desde el **primer día del mes actual** hasta **+90 días**.
- Por evento se devuelve: `titulo`, `inicio`, `fin` (ms), `esTodoElDia`,
  `descripcion`, `ubicacion`.

---

## 14. Hoja `Reportes` (se crea sola)

Registro de enlaces caídos reportados desde las tarjetas (`reportBrokenLink`).
Si no existe, el backend la crea con estos encabezados:

`Fecha | Sección | Nombre | Enlace | Usuario`

El `Usuario` se obtiene de `Session.getActiveUser().getEmail()`.

---

## 15. Tabla resumen

| Hoja | Sección del portal | Columna requerida | Lector |
|---|---|---|---|
| `Herramientas` | Herramientas | Nombre | `readSheet_` |
| `Presentaciones` | Presentaciones | Nombre | `readSheet_` |
| `Paqueterias` | Paqueterías | Nombre | `readSheet_` |
| `Formatos` | Formatos | ACCESO | `readSheet_` |
| `PdePago` | Pago Web | Nombre | `readSheet_` |
| `Plantillas` | Plantillas | Titulo | `readSheet_` |
| `Anuncios` | Inicio (anuncios) | — (reglas propias) | `readAnuncios_` |
| `Avisos` | Inicio (banners legacy) | Mensaje | `readAnuncios_` |
| `Promociones` | Monitor de Promos | dirección/banner | `buildApplicationData_` |
| `MKP` | Monitor de Promos | dirección/banner | `buildApplicationData_` |
| `Reportes` | (escritura) | — | `reportBrokenLink` |

---

📎 Cómo encajan estas hojas en el flujo general:
[`ARQUITECTURA-TECNICA.md`](./ARQUITECTURA-TECNICA.md).
