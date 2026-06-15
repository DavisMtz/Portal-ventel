# 🏗️ Arquitectura técnica del Portal Ventel

> Documento técnico. Describe las tecnologías, la estructura de archivos, el flujo
> de datos y las funciones del backend. Pensado para desarrolladores o personas
> que vayan a dar mantenimiento al proyecto.

---

## 1. Resumen de la arquitectura

El Portal Ventel es una **aplicación web servida desde Google Apps Script**. No
hay servidores externos, ni base de datos tradicional, ni framework de frontend:
todo corre dentro del ecosistema de Google.

```
┌─────────────────────────────────────────────────────────────┐
│                      Google Workspace                        │
│                                                              │
│   ┌──────────────┐         ┌──────────────────────────┐     │
│   │ Google Sheets│◄───────►│  Google Apps Script        │   │
│   │  (los datos) │  lee/   │  coge.gs  (backend)        │   │
│   │              │  escribe│  · doGet() sirve el HTML    │   │
│   └──────────────┘         │  · funciones API           │   │
│   ┌──────────────┐         │  · CacheService (10 min)   │   │
│   │ Google Drive │◄────────│  · DriveApp / CalendarApp  │   │
│   │ (imágenes)   │         └────────────┬───────────────┘   │
│   ├──────────────┤                      │ HtmlService        │
│   │GoogleCalendar│◄─────────────────────┘ + google.script.run│
│   └──────────────┘                      │                    │
└─────────────────────────────────────────┼────────────────────┘
                                          │ HTML servido al navegador
                                          ▼
                          ┌────────────────────────────────┐
                          │   Navegador del asesor          │
                          │   Index.html / Promociones.html │
                          │   · JS vanilla (ES6+)           │
                          │   · GSAP 3.13 (animaciones)     │
                          │   · localStorage (preferencias) │
                          └────────────────────────────────┘
```

**Patrón general:** el cliente (HTML+JS en el navegador) llama a funciones del
servidor (`coge.gs`) mediante `google.script.run`. El servidor lee/escribe en
Google Sheets, Drive y Calendar, cachea el resultado, y devuelve **JSON** que el
cliente renderiza dinámicamente.

---

## 2. Stack tecnológico

| Capa | Tecnología | Para qué |
|---|---|---|
| Hosting / servidor | **Google Apps Script** (`HtmlService`) | Servir la web y exponer la API interna |
| Lenguaje backend | **JavaScript (motor V8 de Apps Script)** | Lógica de servidor en `coge.gs` |
| Almacén de datos | **Google Sheets** | Base de datos de herramientas, plantillas, anuncios, promos |
| Archivos | **Google Drive** | Guardar imágenes de los anuncios |
| Eventos | **Google Calendar** | Calendario de promociones/eventos |
| Frontend | **HTML5 + CSS3 + JavaScript ES6+** | Interfaz, sin framework |
| Animaciones | **GSAP 3.13** (GreenSock) | Transiciones fluidas a 60 FPS |
| Maquetación | **CSS Grid / Flexbox**, enfoque *mobile-first* | Diseño responsivo |
| Persistencia cliente | **localStorage** | Preferencias del asesor y caché local |
| Caché servidor | **CacheService** (Apps Script) | Evitar releer las hojas en cada visita |

No hay paso de *build*, ni `node_modules`, ni bundler. Los archivos `.html` se
suben tal cual al proyecto de Apps Script y GSAP se carga por CDN.

---

## 3. Estructura de archivos

| Archivo | Tipo | Rol |
|---|---|---|
| `coge.gs` | Apps Script (servidor) | Controlador principal: routing, API, caché, lectura/escritura de hojas |
| `Index.html` | Plantilla servida | El portal completo (todas las secciones, estilos y JS del cliente) |
| `Promociones.html` | Plantilla servida | Monitor de promociones y calendario (página `?page=promociones`) |
| `Constructor.html` | Sidebar | Constructor de anuncios (se abre dentro de la hoja) |
| `ConstructorPlantillas.html`| Sidebar | Constructor de plantillas (se abre dentro de la hoja) |
| `LoaderPartial.html` | Parcial | Fragmento HTML reutilizable, incrustado con `include()` |
| `README.md` | Doc | Descripción general del proyecto |

> Nota: `Index.html` y `Promociones.html` son **plantillas de Apps Script**
> (usan scriptlets `<?!= ... ?>`). `coge.gs` les inyecta `APP_URL` antes de
> servirlas.

---

## 4. Routing y renderizado

Todo entra por `doGet(e)` en `coge.gs`:

```js
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'portal';
  var isPromos = (page === 'promociones');
  var template = HtmlService.createTemplateFromFile(isPromos ? 'Promociones' : 'Index');
  template.APP_URL = ScriptApp.getService().getUrl();
  return template.evaluate()
    .setTitle(...)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
```

- `/` → **Index.html** (portal principal).
- `/?page=promociones` → **Promociones.html** (monitor de promos).

`onOpen()` agrega los menús **📢 Anuncios** y **✉️ Plantillas** a la hoja de
cálculo, que abren los sidebars (`Constructor.html` y `ConstructorPlantillas.html`)
vía `SpreadsheetApp.getUi().showSidebar()`.

`include(name)` permite incrustar un archivo HTML dentro de otro
(`<?!= include('LoaderPartial') ?>`).

---

## 5. Estrategia de caché (dos capas)

El rendimiento percibido se basa en una estrategia **stale-while-revalidate**:

**Capa de servidor — `CacheService`:**
- TTL de **600 s (10 min)**, constante `CACHE_TTL_SECONDS`.
- `cacheGet_(key)` / `cachePut_(key, obj)` serializan a JSON.
- Límite por llave ~100 KB: si el JSON supera ~95 000 caracteres, se sirve sin
  cachear (`json.length < 95000`).
- Llaves: `toolsData_v1` (datos del portal) y `appData_v1` (promociones).
- Al publicar/editar anuncios o plantillas se invalida `toolsData_v1` con
  `invalidarCacheAnuncios_()` / `invalidarCachePlantillas_()`.

**Capa de cliente — `localStorage`:**
- La última respuesta se guarda en `ventel-data-v1` (`{ t: timestamp, data }`).
- Al abrir, el cliente **pinta de inmediato** con el dato local y luego
  revalida contra Apps Script en segundo plano; si llega algo nuevo, re-renderiza
  y actualiza el indicador de “última actualización”.

---

## 6. API del backend (`coge.gs`)

Funciones invocables desde el cliente con `google.script.run`. Las privadas
terminan en `_` (convención de Apps Script, no expuestas).

### Datos del portal
| Función | Devuelve | Notas |
|---|---|---|
| `fetchToolsData()` | `{ herramientas, presentaciones, paqueterias, formatos, pdePago, plantillas, avisos, anuncios, status, error }` | Cacheada (`toolsData_v1`). Construida por `buildToolsData_()` |
| `readSheet_(ss, sheetName, fields, requiredKey)` | `Object[]` | Lector genérico de hojas con encabezados; mapea alias de columna → campo |

### Anuncios
| Función | Rol |
|---|---|
| `readAnuncios_(ss)` | Lee hoja `Anuncios` (JSON) + legacy `Avisos`; filtra activos/no expirados, ordena por `orden` |
| `publicarAnuncio(payload)` | Crea/actualiza una fila (upsert por `ID`) |
| `getAnunciosAdmin()` | Devuelve **todos** (activos, inactivos, programados, expirados) para el sidebar |
| `eliminarAnuncio(id)` / `toggleAnuncio(id, activo)` / `moverAnuncio(id, dir)` | Borrar / activar / reordenar |
| `subirImagenAnuncio(payload)` | Guarda imagen base64 en Drive (carpeta “Portal Ventel”), la comparte por enlace y devuelve la URL `thumbnail` |

### Plantillas
| Función | Rol |
|---|---|
| `guardarPlantilla(payload)` | Crea/actualiza una plantilla (upsert por `ID`) |
| `getPlantillasAdmin()` | Devuelve todas para el sidebar; asigna `ID` faltantes |
| `eliminarPlantilla(id)` | Borrar |

### Promociones
| Función | Devuelve |
|---|---|
| `fetchApplicationData()` | `{ promociones, eventos, status, error }` (cacheada `appData_v1`) |
| `fetchPromoCounts()` | `{ activas, porTerminar }` para el widget del dashboard |
| `parseVigencia_(str, now)` / `monthIdx_(name)` | Interpretan textos de vigencia tipo *“3 al 15 de junio”* |

### Reportes
| Función | Rol |
|---|---|
| `reportBrokenLink(report)` | Registra fecha, sección, nombre, enlace y usuario en la hoja `Reportes` (la crea si no existe) |

---

## 7. Lectura flexible de hojas

El corazón de la robustez es `readSheet_()`. En vez de depender de un orden fijo
de columnas, **detecta cada columna por su encabezado** usando una lista de
alias (busca la primera columna cuyo encabezado *contenga* alguno):

```js
response.herramientas = readSheet_(ss, 'Herramientas', {
  nombre:      ['nombre'],
  enlace:      ['enlace', 'liga', 'link', 'url'],
  comoAcceder: ['acceder', 'acceso', 'como'],
  descripcion: ['descrip'],
  claves:      ['clave']
}, 'nombre');   // 'nombre' es la columna requerida: filas sin nombre se omiten
```

Esto permite que quien administra la hoja renombre o reordene columnas con cierta
libertad sin romper el portal. La misma idea se usa en `anunciosCols_()` y
`plantillasCols_()`.

---

## 8. Frontend (cliente)

- **Sin framework**: JavaScript vanilla ES6+ manipulando el DOM directamente.
- **Navegación SPA**: las secciones son `<section class="view-section">` que se
  muestran/ocultan; se usa `google.script.history` para que el botón “atrás” del
  navegador funcione y se puedan compartir enlaces a una sección concreta.
- **Animaciones**: **GSAP 3.13** anima `transform` y `opacity` (delegadas a GPU)
  para mantener 60 FPS y evitar *reflows* costosos.
- **Buscador difuso**: búsqueda *fuzzy* del lado del cliente (tolera errores de
  tecleo y coincidencias parciales) con puntuación (`score`) sobre los datos ya
  cargados en memoria.
- **Preferencias locales** (`localStorage`), helpers `lsGet`/`lsSet`:

| Llave | Contenido |
|---|---|
| `ventel-theme` | Tema visual elegido |
| `ventel-usage` | Conteo de clics por herramienta → ordena accesos rápidos |
| `ventel-pins` | Herramientas fijadas con el pin |
| `ventel-recent` | Últimas búsquedas (máx. 5) |
| `ventel-avisos-out` | IDs de anuncios descartados (banner/modal) |
| `ventel-data-v1` | Caché local de la última respuesta de datos |
| `ventel-coach-done` | Si ya se mostró el tutorial inicial |

---

## 9. Integraciones de Google usadas

- **SpreadsheetApp** — lectura/escritura de todas las hojas; UI de menús y sidebars.
- **CacheService** — caché de servidor de 10 min.
- **DriveApp** — almacenamiento de imágenes de anuncios (carpeta `Portal Ventel`,
  compartidas como *cualquiera con el enlace · ver*; límite 8 MB por imagen).
- **CalendarApp** — eventos de promociones desde un calendario específico
  (`liverpool.com.mx_...@group.calendar.google.com`), ventana de mes actual a +90 días.
- **Session** — `getActiveUser().getEmail()` para registrar autor de anuncios y
  usuario que reporta enlaces.
- **Utilities** — base64 (imágenes) y formateo de fechas con zona horaria del script.

---

## 10. Consideraciones y límites

- **Sin base de datos transaccional**: la concurrencia depende de Google Sheets;
  el upsert busca la fila por `ID` y la sobrescribe.
- **Límite de caché**: respuestas > ~95 KB no se cachean en servidor (se recalculan).
- **Permisos**: cualquier editor de la hoja puede publicar anuncios/plantillas.
- **Favicon**: se define con `<link rel="icon">` en el `<head>` y **no** con
  `setFaviconUrl()`, porque ese método rechaza SVG y data-URIs.
- **Fechas**: las fechas se construyen con argumentos numéricos
  (`new Date(y, m, d, ...)`) para usar la zona horaria del script y evitar el
  corrimiento de un día que produce `new Date('YYYY-MM-DD')` (interpretado en UTC).

---

📎 Para el detalle de cada hoja y sus columnas, ver
[`REFERENCIA-DE-DATOS.md`](./REFERENCIA-DE-DATOS.md).
