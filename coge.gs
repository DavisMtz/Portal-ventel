/**
 * @fileoverview Controlador principal de Google Apps Script.
 * Sirve la interfaz web y expone las APIs internas para la recuperación de datos.
 *
 * Páginas disponibles:
 *   /           → Portal principal (Index.html)
 *   /?page=promociones → Monitor de promociones (Promociones.html)
 */

// ── 1. ROUTING Y RENDERIZADO ──────────────────────────────────────────────────

// Isotipo Liverpool (magenta de marca) como favicon de la web app. En Apps Script
// el favicon de la pestaña lo fija HtmlOutput.setFaviconUrl(), no el <link> del HTML
// (la página se sirve dentro de un iframe). Se usa un data URI SVG para no depender
// de hosting externo.
var FAVICON_URL = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22172.8%20116.2%20229%20197.1%22%3E%3Cpath%20fill%3D%22%23E10098%22%20d%3D%22M173.37%20116.8c-0.6%200.7%20-0.33%20178.17%200.27%20180.2c0.23%200.83%201.13%202.9%201.93%204.57c1.27%202.63%201.9%203.47%204.23%205.67c3.57%203.37%207.13%205.17%2011.37%205.8c1.13%200.17%2025.4%200.27%2055.83%200.23l53.83%20-0.1l0%20-8.67l0%20-8.67l-50.17%20-0.17c-51.83%20-0.17%20-50.7%20-0.13%20-53.5%20-1.47c-1.07%20-0.53%20-3.7%20-3.2%20-4.43%20-4.5c-1.43%20-2.5%20-1.4%20-0.03%20-1.4%20-88.23c0%20-55.37%20-0.13%20-84.1%20-0.37%20-84.5c-0.3%20-0.6%20-0.87%20-0.63%20-8.77%20-0.63c-6.73%200%20-8.53%200.1%20-8.83%200.47Z%20M198.53%20116.87c-0.47%200.47%20-0.53%208.3%20-0.53%2081.27c0%2086.6%20-0.07%2082.3%201.57%2085.37c0.73%201.37%202.4%203.1%203.6%203.77c2.87%201.57%201.47%201.53%2050.47%201.63c30.2%200.03%2046.33%20-0.03%2046.73%20-0.27c0.6%20-0.3%200.63%20-0.87%200.63%20-8.97l0%20-8.63l-38.23%20-0.13c-35.17%20-0.07%20-38.4%20-0.13%20-39.9%20-0.67c-2.1%20-0.73%20-3.67%20-1.93%20-4.73%20-3.63c-1.9%20-3%20-1.8%201.13%20-1.8%20-76.97c0%20-49%20-0.1%20-72.2%20-0.33%20-72.67c-0.33%20-0.6%20-0.8%20-0.63%20-8.67%20-0.63c-7.1%200%20-8.37%200.07%20-8.8%200.53Z%20M223.67%20116.67c-0.43%200.27%20-0.5%208.33%20-0.6%2068.73c-0.1%2062.73%20-0.03%2068.63%200.47%2070.77c0.83%203.53%202.73%205.87%205.97%207.27c1.23%200.53%203.73%200.57%2036.33%200.5l35%20-0.1l0%20-8.83l0%20-8.83l-27.33%20-0.17c-30.47%20-0.2%20-28.37%200%20-30.43%20-2.5c-0.77%20-0.97%20-1.03%20-1.73%20-1.37%20-3.93c-0.27%20-1.97%20-0.37%20-19.43%20-0.37%20-62.6c0%20-46.1%20-0.1%20-59.93%20-0.4%20-60.23c-0.5%20-0.5%20-16.5%20-0.57%20-17.27%20-0.07Z%20M248.73%20116.73c-0.57%200.57%20-0.57%20114.4%200%20116.4c0.7%202.43%201.93%203.9%204.37%205.2c1.23%200.63%201.87%200.67%2024.17%200.67c12.6%200.03%2023.1%200.03%2023.33%200c0.33%200%200.4%20-1.87%200.33%20-8.77l-0.1%20-8.73l-15%20-0.17c-14.87%20-0.17%20-15%20-0.17%20-16.2%20-0.93c-1.37%20-0.83%20-2.23%20-1.97%20-2.67%20-3.53c-0.17%20-0.6%20-0.3%20-22.03%20-0.3%20-50.07c0%20-43.47%20-0.07%20-49.1%20-0.53%20-49.73c-0.5%20-0.73%20-0.63%20-0.73%20-8.77%20-0.73c-5.97%200%20-8.33%200.1%20-8.63%200.4Z%20M273.87%20117.1c-0.73%201.1%20-0.7%2016%200.03%2016.73c0.43%200.43%206.67%200.5%2049.7%200.5c51.83%200%2050.37%20-0.03%2053.73%201.43c3.13%201.37%205.3%205.07%205.7%209.73c0.17%201.63%200.27%2039.97%200.27%2085.13c0%2045.17%200.13%2082.27%200.3%2082.43c0.13%200.13%204.17%200.23%208.93%200.2l8.63%20-0.1l0.2%20-3.5c0.4%20-6.23%200.33%20-169.13%20-0.07%20-172.8c-0.67%20-6.37%20-2.13%20-9.63%20-6.3%20-13.83c-3.9%20-3.93%20-7.47%20-5.67%20-13%20-6.37c-1.83%20-0.2%20-21%20-0.33%20-55.23%20-0.33l-52.43%200l-0.47%200.77Z%20M274%20141.33c-0.43%200.27%20-0.5%201.6%20-0.53%208.4c-0.03%204.47%200.07%208.37%200.23%208.67c0.3%200.53%202.73%200.6%2038.57%200.7c33.2%200.07%2038.4%200.17%2039.4%200.6c3.37%201.43%204.43%202.5%205.63%205.57l0.7%201.77l0%2072.63c0%2039.93%200.1%2072.83%200.2%2073.13c0.17%200.47%201.3%200.53%209%200.53l8.77%200l0.2%20-1.1c0.1%20-0.57%200.17%20-37.6%200.1%20-82.23l-0.1%20-81.17l-1.13%20-2.1c-1.23%20-2.27%20-3.13%20-3.9%20-5.7%20-4.97c-1.4%20-0.57%20-4.13%20-0.6%20-48.17%20-0.67c-29.33%20-0.07%20-46.87%200.03%20-47.17%200.23Z%20M273.73%20166.43c-0.23%200.27%20-0.33%203.2%20-0.3%208.67c0.07%206.9%200.17%208.3%200.57%208.57c0.3%200.2%2011.13%200.33%2027.27%200.33c24%200%2026.87%200.07%2027.83%200.53c1.5%200.77%202.53%201.77%203.17%203.13c0.53%201.07%200.57%206.27%200.73%2063.33l0.17%2062.17l8.9%200.1l8.93%200.07l0.17%20-0.73c0.1%20-0.43%200.13%20-32.03%200.1%20-70.27l-0.1%20-69.5l-0.77%20-1.33c-1.07%20-1.9%20-3.37%20-4.1%20-5.03%20-4.87c-1.4%20-0.6%20-2.5%20-0.63%20-36.37%20-0.63c-28.1%200%20-35%200.1%20-35.27%200.43Z%20M274.1%20190.87c-0.63%200.27%20-0.63%2016.9%200%2017.4c0.3%200.23%205.3%200.4%2015.13%200.47l14.7%200.1l1.3%201.03c0.7%200.57%201.57%201.53%201.93%202.17c0.67%201.1%200.67%201.9%200.83%2051.13l0.17%2050l8.83%200l8.83%200l0.1%20-58.27c0.07%20-56.7%200.07%20-58.3%20-0.57%20-59.5c-0.8%20-1.6%20-2.17%20-2.93%20-3.87%20-3.87c-1.33%20-0.7%20-1.5%20-0.7%20-24.17%20-0.77c-12.57%20-0.03%20-23.03%200%20-23.23%200.1Z%22%2F%3E%3C%2Fsvg%3E';

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'portal';
  var appUrl = ScriptApp.getService().getUrl();
  var isPromos = (page === 'promociones');

  var template = HtmlService.createTemplateFromFile(isPromos ? 'Promociones' : 'Index');
  template.APP_URL = appUrl;

  return template.evaluate()
    .setTitle(isPromos ? 'Monitor de Promociones | Liverpool · VENTEL' : 'Portal VENTEL · Liverpool')
    .setFaviconUrl(FAVICON_URL)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ── 1b. MENÚ Y CONSTRUCTOR DE ANUNCIOS (sidebar dentro de la hoja) ────────────
// Al abrir la hoja se agrega un menú "📢 Anuncios"; desde ahí los supervisores
// abren un sidebar (Constructor.html) que escribe las publicaciones como JSON en
// la hoja "Anuncios". Cualquier editor de la hoja puede publicar.

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📢 Anuncios')
    .addItem('Abrir constructor…', 'mostrarConstructorAnuncios')
    .addToUi();
  ui.createMenu('✉️ Plantillas')
    .addItem('Abrir constructor…', 'mostrarConstructorPlantillas')
    .addToUi();
}

function mostrarConstructorAnuncios() {
  const html = HtmlService.createHtmlOutputFromFile('Constructor')
    .setTitle('Constructor de Anuncios');
  SpreadsheetApp.getUi().showSidebar(html);
}

function mostrarConstructorPlantillas() {
  const html = HtmlService.createHtmlOutputFromFile('ConstructorPlantillas')
    .setTitle('Constructor de Plantillas');
  SpreadsheetApp.getUi().showSidebar(html);
}

// Inserta un archivo HTML dentro de otro en las plantillas: <?!= include('LoaderPartial') ?>
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

// ── 2. CACHÉ ──────────────────────────────────────────────────────────────────
// Las hojas cambian poco; servir desde CacheService evita releer 5+ hojas en
// cada visita (el límite por llave es ~100KB, si se excede se sirve sin caché).

var CACHE_TTL_SECONDS = 600; // 10 minutos

function cacheGet_(key) {
  try {
    const hit = CacheService.getScriptCache().get(key);
    if (hit) return JSON.parse(hit);
  } catch (e) {}
  return null;
}

function cachePut_(key, obj) {
  try {
    const json = JSON.stringify(obj);
    if (json.length < 95000) CacheService.getScriptCache().put(key, json, CACHE_TTL_SECONDS);
  } catch (e) {}
}

// ── 3. DATOS DEL PORTAL (Herramientas, Presentaciones, Paqueterías, Formatos, PdePago, Avisos) ──

function fetchToolsData() {
  const cached = cacheGet_('toolsData_v1');
  if (cached) return cached;
  const data = buildToolsData_();
  if (data.status === 'ok') cachePut_('toolsData_v1', data);
  return data;
}

/**
 * Lee una hoja con encabezados en la primera fila y devuelve un arreglo de objetos.
 *
 * @param {Spreadsheet} ss        Hoja de cálculo activa.
 * @param {string} sheetName      Nombre de la hoja a leer.
 * @param {Object<string,string[]>} fields  Mapa campoSalida → lista de alias de encabezado.
 *                                  Se asigna la primera columna cuyo encabezado contenga
 *                                  cualquiera de los alias (mismo criterio que el código previo).
 * @param {string} requiredKey    Campo cuyo valor vacío hace que la fila se omita.
 * @return {Object[]}             Filas como objetos de strings recortados ('' si falta la columna).
 */
function readSheet_(ss, sheetName, fields, requiredKey) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (!data.length) return [];

  const hdr = data[0].map(h => h.toString().toLowerCase().trim());
  const idx = {};
  Object.keys(fields).forEach(key => {
    idx[key] = hdr.findIndex(h => fields[key].some(alias => h.includes(alias)));
  });

  const reqIdx = idx[requiredKey];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (reqIdx < 0 || !row[reqIdx] || !row[reqIdx].toString().trim()) continue;
    const obj = {};
    Object.keys(fields).forEach(key => {
      obj[key] = idx[key] > -1 ? String(row[idx[key]] || '').trim() : '';
    });
    out.push(obj);
  }
  return out;
}

function buildToolsData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const response = {
    herramientas: [],
    presentaciones: [],
    paqueterias: [],
    formatos: [],
    pdePago: [],
    plantillas: [],
    avisos: [],
    anuncios: [],
    status: 'ok',
    error: null
  };

  try {

    // ── Hoja: Herramientas ──
    // Columnas: Nombre | Enlace | Como acceder | Descripcion | Claves
    response.herramientas = readSheet_(ss, 'Herramientas', {
      nombre:      ['nombre'],
      enlace:      ['enlace', 'liga', 'link', 'url'],
      comoAcceder: ['acceder', 'acceso', 'como'],
      descripcion: ['descrip'],
      claves:      ['clave']
    }, 'nombre');

    // ── Hoja: Presentaciones ──
    // Columnas: Nombre | LIGA | DESCRIPCION
    response.presentaciones = readSheet_(ss, 'Presentaciones', {
      nombre:      ['nombre'],
      liga:        ['liga', 'enlace', 'link', 'url'],
      descripcion: ['descrip']
    }, 'nombre');

    // ── Hoja: Paqueterias ──
    // Columnas: Nombre | Liga | Soms
    response.paqueterias = readSheet_(ss, 'Paqueterias', {
      nombre: ['nombre'],
      liga:   ['liga', 'enlace', 'link', 'url'],
      soms:   ['soms', 'sistema']
    }, 'nombre');

    // ── Hoja: Formatos ──
    // Columnas: ACCESO | OBSERVACIONES | LIGA
    response.formatos = readSheet_(ss, 'Formatos', {
      acceso:        ['acceso', 'nombre', 'formato'],
      observaciones: ['observ', 'nota'],
      liga:          ['liga', 'enlace', 'link']
    }, 'acceso');

    // ── Hoja: PdePago ──
    // Columnas: Nombre | Detalles | Liga
    response.pdePago = readSheet_(ss, 'PdePago', {
      nombre:   ['nombre'],
      detalles: ['detalle', 'descrip', 'info'],
      liga:     ['liga', 'enlace', 'link', 'url', 'simulad']
    }, 'nombre');

    // ── Hoja: Plantillas ──
    // Columnas: Titulo | Tipo | Asunto | Cuerpo | Consideraciones
    //   · Tipo "Correo"     → usa Asunto + Cuerpo + Consideraciones.
    //   · Tipo "Sales Force" → usa solo Cuerpo + Consideraciones (Asunto se ignora).
    // En el Cuerpo, cualquier fragmento entre corchetes [ ... ] se interpreta en el
    // portal como un campo editable; al copiar se reemplaza por el texto que escriba
    // el asesor. En Consideraciones se ponen notas y los correos de copia obligatoria
    // o escalamiento (el portal detecta los correos y los ofrece para copiar).
    response.plantillas = readSheet_(ss, 'Plantillas', {
      titulo:          ['titulo', 'título', 'nombre', 'plantilla'],
      tipo:            ['tipo'],
      asunto:          ['asunto', 'subject'],
      cuerpo:          ['cuerpo', 'body', 'mensaje', 'texto', 'contenido'],
      consideraciones: ['consider', 'nota', 'escalam', 'copia', 'observ']
    }, 'titulo');

    // ── Anuncios (hoja "Anuncios" en JSON + respaldo legacy "Avisos") ──
    response.anuncios = readAnuncios_(ss);
    // Compatibilidad: cachés antiguas del cliente aún leen "avisos" (solo banners).
    response.avisos = response.anuncios
      .filter(a => a.formato === 'banner')
      .map(a => ({ mensaje: a.mensaje || '', tipo: a.tono || 'info' }));

  } catch (error) {
    response.status = 'error';
    response.error = error.toString();
    Logger.log('fetchToolsData error: ' + error);
  }

  return response;
}

// ── 3b. ANUNCIOS (hoja "Anuncios" en JSON) ───────────────────────────────────
// Cada fila es una publicación. Columnas:
//   ID | Formato | Activo | Orden | Hasta | Datos (JSON) | Autor | Creado
// Formatos: 'banner' | 'destacado' | 'tarjeta' | 'modal'.
// La columna Datos guarda el contenido propio de cada formato (ver Constructor.html).

var ANUNCIOS_SHEET   = 'Anuncios';
var ANUNCIOS_HEADERS = ['ID', 'Formato', 'Activo', 'Orden', 'Desde', 'Hasta', 'Datos (JSON)', 'Autor', 'Creado'];
var ANUNCIOS_FORMATOS = ['banner', 'destacado', 'tarjeta', 'modal'];

function anunciosSheet_(ss, create) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ANUNCIOS_SHEET);
  if (!sheet && create) {
    sheet = ss.insertSheet(ANUNCIOS_SHEET);
    sheet.appendRow(ANUNCIOS_HEADERS);
    sheet.getRange(1, 1, 1, ANUNCIOS_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Localiza las columnas por encabezado (mismo criterio flexible que readSheet_).
function anunciosCols_(hdr) {
  const h = hdr.map(x => x.toString().toLowerCase().trim());
  return {
    id:      h.findIndex(x => x.includes('id')),
    formato: h.findIndex(x => x.includes('formato')),
    activo:  h.findIndex(x => x.includes('activo')),
    orden:   h.findIndex(x => x.includes('orden')),
    desde:   h.findIndex(x => x.includes('desde') || x.includes('inicio')),
    hasta:   h.findIndex(x => x.includes('hasta') || x.includes('vigen') || x.includes('fecha')),
    datos:   h.findIndex(x => x.includes('dato') || x.includes('json')),
    autor:   h.findIndex(x => x.includes('autor')),
    creado:  h.findIndex(x => x.includes('creado') || x.includes('creacion'))
  };
}

// Garantiza que la hoja tenga la columna "Desde" (se agrega al final si falta,
// para no romper hojas creadas antes de la programación de anuncios).
function ensureDesdeCol_(sheet) {
  const hdr = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const has = hdr.some(x => { const s = String(x).toLowerCase(); return s.includes('desde') || s.includes('inicio'); });
  if (!has) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('Desde').setFontWeight('bold');
  }
}

function esActivo_(v) {
  if (v === true) return true;
  if (v === false) return false;
  const s = String(v).trim().toLowerCase();
  return s === '' || s === 'true' || s === 'si' || s === 'sí' || s === '1' || s === 'x' || s === 'activo';
}

/**
 * Lee la hoja "Anuncios" (publicaciones en JSON) y la hoja legacy "Avisos".
 * Devuelve los anuncios visibles: activos y no expirados, ordenados por "Orden".
 * @return {Object[]} [{ id, formato, tono?, ...datos }]
 */
function readAnuncios_(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  // Inicio del día de HOY: "Hasta" es inclusivo de todo ese día. Un anuncio expira
  // solo cuando su fecha cae en un día anterior a hoy (así una fecha guardada a las
  // 00:00 —p. ej. editada a mano en la hoja— sigue visible toda la jornada).
  const hoy0 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const out = [];

  const sheet = ss.getSheetByName(ANUNCIOS_SHEET);
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      const c = anunciosCols_(data[0]);
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (c.activo > -1 && !esActivo_(row[c.activo])) continue;
        if (c.desde > -1 && row[c.desde] instanceof Date && row[c.desde] > now) continue; // programado: aún no inicia
        if (c.hasta > -1 && row[c.hasta] instanceof Date && row[c.hasta] < hoy0) continue; // expirado (día anterior a hoy)
        let datos = {};
        if (c.datos > -1 && row[c.datos]) {
          try { datos = JSON.parse(String(row[c.datos])); } catch (e) { datos = {}; }
        }
        const formato = c.formato > -1 && row[c.formato]
          ? String(row[c.formato]).trim().toLowerCase() : 'banner';
        if (ANUNCIOS_FORMATOS.indexOf(formato) < 0) continue;
        out.push(Object.assign({
          id:      c.id > -1 && row[c.id] ? String(row[c.id]).trim() : 'anc-row-' + i,
          formato: formato,
          orden:   c.orden > -1 && row[c.orden] !== '' ? Number(row[c.orden]) || 0 : 0
        }, datos));
      }
    }
  }

  // Respaldo de migración: avisos viejos de la hoja "Avisos" → formato banner.
  const sheetA = ss.getSheetByName('Avisos');
  if (sheetA) {
    const dataA = sheetA.getDataRange().getValues();
    if (dataA.length > 1) {
      const hdr = dataA[0].map(h => h.toString().toLowerCase().trim());
      const iMsg   = hdr.findIndex(h => h.includes('mensaje') || h.includes('aviso') || h.includes('texto'));
      const iTipo  = hdr.findIndex(h => h.includes('tipo'));
      const iHasta = hdr.findIndex(h => h.includes('hasta') || h.includes('vigen') || h.includes('fecha'));
      for (let i = 1; i < dataA.length; i++) {
        const row = dataA[i];
        if (iMsg < 0 || !row[iMsg] || !row[iMsg].toString().trim()) continue;
        if (iHasta > -1 && row[iHasta] instanceof Date && row[iHasta] < hoy0) continue;
        out.push({
          id:      'avi-' + i,
          formato: 'banner',
          orden:   1000 + i,
          tono:    iTipo > -1 && row[iTipo] ? String(row[iTipo]).trim().toLowerCase() : 'info',
          mensaje: String(row[iMsg]).trim()
        });
      }
    }
  }

  out.sort((a, b) => (a.orden || 0) - (b.orden || 0));
  return out;
}

// Invalida la caché del portal para que el index revalide tras un cambio.
function invalidarCacheAnuncios_() {
  try { CacheService.getScriptCache().remove('toolsData_v1'); } catch (e) {}
}

/**
 * Convierte 'YYYY-MM-DD' en una fecha LOCAL. Por defecto al FIN del día (23:59:59)
 * para "Hasta"; con inicio=true al INICIO del día (00:00:00) para "Desde".
 * Construir con argumentos numéricos usa la zona horaria del script, evitando el
 * corrimiento de un día que produce `new Date('YYYY-MM-DD')` (que se interpreta en UTC).
 * Devuelve '' si no hay fecha.
 */
function parseFechaLocal_(str, inicio) {
  const m = String(str || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const d = inicio
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0)
    : new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59);
  return isNaN(d.getTime()) ? '' : d;
}

// ── Imágenes de anuncios en Drive ─────────────────────────────────────────────
var ANUNCIOS_FOLDER = 'Portal Ventel';

// Reutiliza la carpeta "Portal Ventel" si existe; si no, la crea.
function carpetaAnuncios_() {
  const it = DriveApp.getFoldersByName(ANUNCIOS_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(ANUNCIOS_FOLDER);
}

/**
 * Recibe una imagen como data:URL base64 desde el constructor, la guarda en Drive
 * (carpeta "Portal Ventel"), la comparte como visible con el enlace y devuelve la URL.
 * @param {Object} payload { dataUrl, nombre }
 * @return {Object} { status:'ok', url, id } | { status:'error', error }
 */
function subirImagenAnuncio(payload) {
  try {
    if (!payload || !payload.dataUrl) throw new Error('No se recibió la imagen.');
    const m = String(payload.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error('Formato de imagen no válido.');
    const mime = m[1];
    if (mime.indexOf('image/') !== 0) throw new Error('El archivo no es una imagen.');
    const bytes = Utilities.base64Decode(m[2]);
    if (bytes.length > 8 * 1024 * 1024) throw new Error('La imagen supera el límite de 8 MB.');

    const nombre = (String(payload.nombre || 'anuncio').replace(/[^\w.\-]+/g, '_')) + '-' + Date.now();
    const blob = Utilities.newBlob(bytes, mime, nombre);
    const file = carpetaAnuncios_().createFile(blob);
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}

    const url = 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200';
    return { status: 'ok', url: url, id: file.getId() };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

/**
 * Crea o actualiza una publicación. Escribe el contenido como JSON.
 * @param {Object} payload { id?, formato, activo, orden, hasta, datos }
 * @return {Object} { status, id } | { status:'error', error }
 */
function publicarAnuncio(payload) {
  try {
    if (!payload || !payload.formato) throw new Error('Falta el formato del anuncio.');
    const formato = String(payload.formato).trim().toLowerCase();
    if (ANUNCIOS_FORMATOS.indexOf(formato) < 0) throw new Error('Formato no válido: ' + formato);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = anunciosSheet_(ss, true);
    ensureDesdeCol_(sheet);
    const width = sheet.getLastColumn();
    const c = anunciosCols_(sheet.getRange(1, 1, 1, width).getValues()[0]);

    const datos = payload.datos && typeof payload.datos === 'object' ? payload.datos : {};
    const activo = payload.activo === undefined ? true : !!payload.activo;
    const orden  = Number(payload.orden) || 0;
    let user = '';
    try { user = Session.getActiveUser().getEmail(); } catch (e) {}

    const id = payload.id && String(payload.id).trim()
      ? String(payload.id).trim()
      : 'anc-' + Date.now().toString(36);

    const rowValues = [];
    rowValues[c.id]      = id;
    rowValues[c.formato] = formato;
    rowValues[c.activo]  = activo;
    rowValues[c.orden]   = orden;
    if (c.desde > -1) rowValues[c.desde] = parseFechaLocal_(payload.desde, true);
    rowValues[c.hasta]   = parseFechaLocal_(payload.hasta);
    rowValues[c.datos]   = JSON.stringify(datos);
    rowValues[c.autor]   = user;
    rowValues[c.creado]  = new Date();

    // ¿Existe ya esa fila? → actualizar; si no, agregar.
    const rowIdx = findAnuncioRow_(sheet, c, id);
    if (rowIdx > 0) {
      sheet.getRange(rowIdx, 1, 1, width).setValues([fillRow_(rowValues, width)]);
    } else {
      sheet.appendRow(fillRow_(rowValues, width));
    }

    invalidarCacheAnuncios_();
    return { status: 'ok', id: id };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

function fillRow_(arr, len) {
  const out = [];
  for (let i = 0; i < len; i++) out[i] = (arr[i] === undefined || arr[i] === null) ? '' : arr[i];
  return out;
}

function findAnuncioRow_(sheet, c, id) {
  if (c.id < 0) return -1;
  const last = sheet.getLastRow();
  if (last < 2) return -1;
  const ids = sheet.getRange(2, c.id + 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) return i + 2;
  }
  return -1;
}

/** Devuelve TODAS las publicaciones (activas, inactivas y expiradas) para el sidebar. */
function getAnunciosAdmin() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ANUNCIOS_SHEET);
    if (!sheet) return { status: 'ok', anuncios: [] };
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return { status: 'ok', anuncios: [] };
    const c = anunciosCols_(data[0]);
    const tz = Session.getScriptTimeZone();
    const now = new Date();
    const hoy0 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const anuncios = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (c.id < 0 || !row[c.id]) continue;
      let datos = {};
      if (c.datos > -1 && row[c.datos]) { try { datos = JSON.parse(String(row[c.datos])); } catch (e) {} }
      const desde = c.desde > -1 && row[c.desde] instanceof Date ? row[c.desde] : null;
      const hasta = c.hasta > -1 && row[c.hasta] instanceof Date ? row[c.hasta] : null;
      const activo = c.activo > -1 ? esActivo_(row[c.activo]) : true;
      let estado;
      if (!activo) estado = 'inactivo';
      else if (desde && desde > now) estado = 'programado';
      else if (hasta && hasta < hoy0) estado = 'expirado';
      else estado = 'activo';
      anuncios.push({
        id:      String(row[c.id]).trim(),
        formato: c.formato > -1 ? String(row[c.formato]).trim().toLowerCase() : 'banner',
        activo:  activo,
        estado:  estado,
        orden:   c.orden > -1 ? (Number(row[c.orden]) || 0) : 0,
        desde:   desde ? Utilities.formatDate(desde, tz, 'yyyy-MM-dd') : '',
        hasta:   hasta ? Utilities.formatDate(hasta, tz, 'yyyy-MM-dd') : '',
        datos:   datos
      });
    }
    anuncios.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    return { status: 'ok', anuncios: anuncios };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

function eliminarAnuncio(id) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ANUNCIOS_SHEET);
    if (!sheet) return { status: 'error', error: 'No existe la hoja Anuncios.' };
    const c = anunciosCols_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
    const rowIdx = findAnuncioRow_(sheet, c, String(id).trim());
    if (rowIdx < 0) return { status: 'error', error: 'No se encontró el anuncio.' };
    sheet.deleteRow(rowIdx);
    invalidarCacheAnuncios_();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

function toggleAnuncio(id, activo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ANUNCIOS_SHEET);
    if (!sheet) return { status: 'error', error: 'No existe la hoja Anuncios.' };
    const c = anunciosCols_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
    const rowIdx = findAnuncioRow_(sheet, c, String(id).trim());
    if (rowIdx < 0 || c.activo < 0) return { status: 'error', error: 'No se encontró el anuncio.' };
    sheet.getRange(rowIdx, c.activo + 1).setValue(!!activo);
    invalidarCacheAnuncios_();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

/**
 * Reordena un anuncio una posición arriba ('up') o abajo ('down'), intercambiándolo
 * con su vecino. Renumera la columna Orden de forma secuencial y estable.
 * @return {Object} { status } | { status:'error', error }
 */
function moverAnuncio(id, dir) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ANUNCIOS_SHEET);
    if (!sheet) return { status: 'error', error: 'No existe la hoja Anuncios.' };
    const last = sheet.getLastRow();
    if (last < 2) return { status: 'ok' };
    const c = anunciosCols_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
    if (c.orden < 0 || c.id < 0) return { status: 'error', error: 'Faltan columnas ID/Orden.' };

    const vals = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
    const items = vals.map((row, i) => ({
      rowIdx: i + 2,
      id: String(row[c.id]).trim(),
      orden: Number(row[c.orden]) || 0
    }));
    // Orden estable: por "Orden" y, a igualdad, por posición física.
    items.sort((a, b) => (a.orden - b.orden) || (a.rowIdx - b.rowIdx));

    const idx = items.findIndex(it => it.id === String(id).trim());
    if (idx < 0) return { status: 'error', error: 'No se encontró el anuncio.' };
    const j = dir === 'up' ? idx - 1 : idx + 1;
    if (j < 0 || j >= items.length) return { status: 'ok' }; // ya está en el extremo

    const tmp = items[idx]; items[idx] = items[j]; items[j] = tmp;

    // Renumera secuencialmente (10, 20, 30…) y escribe la columna Orden de una vez.
    const ordenCol = new Array(last - 1);
    items.forEach((it, k) => { ordenCol[it.rowIdx - 2] = [(k + 1) * 10]; });
    sheet.getRange(2, c.orden + 1, last - 1, 1).setValues(ordenCol);

    invalidarCacheAnuncios_();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

// ── 3c. PLANTILLAS (constructor en sidebar → hoja "Plantillas") ───────────────
// El constructor (ConstructorPlantillas.html) crea y edita filas de la hoja
// "Plantillas". Para poder editar/borrar una fila concreta se usa una columna
// "ID" (se agrega sola si la hoja se creó a mano sin ella). El portal la ignora,
// solo lee Titulo | Tipo | Asunto | Cuerpo | Consideraciones.

var PLANTILLAS_SHEET   = 'Plantillas';
var PLANTILLAS_HEADERS = ['ID', 'Titulo', 'Tipo', 'Asunto', 'Cuerpo', 'Consideraciones'];

function plantillasSheet_(ss, create) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PLANTILLAS_SHEET);
  if (!sheet && create) {
    sheet = ss.insertSheet(PLANTILLAS_SHEET);
    sheet.appendRow(PLANTILLAS_HEADERS);
    sheet.getRange(1, 1, 1, PLANTILLAS_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Localiza columnas por encabezado (criterio flexible, igual que readSheet_).
function plantillasCols_(hdr) {
  const h = hdr.map(x => x.toString().toLowerCase().trim());
  const find = aliases => h.findIndex(x => aliases.some(a => x.includes(a)));
  return {
    id:              h.findIndex(x => x === 'id'),
    titulo:          find(['titulo', 'título', 'nombre', 'plantilla']),
    tipo:            find(['tipo']),
    asunto:          find(['asunto', 'subject']),
    cuerpo:          find(['cuerpo', 'body', 'mensaje', 'texto', 'contenido']),
    consideraciones: find(['consider', 'nota', 'escalam', 'copia', 'observ'])
  };
}

// Garantiza la columna "ID" (se inserta al inicio si la hoja se creó sin ella).
function ensurePlantillaIdCol_(sheet) {
  const hdr = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const has = hdr.some(x => String(x).toLowerCase().trim() === 'id');
  if (!has) {
    sheet.insertColumnBefore(1);
    sheet.getRange(1, 1).setValue('ID').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

// Normaliza el tipo a uno de los dos valores canónicos.
function pltTipoNormaliza_(tipo) {
  const t = String(tipo || '').toLowerCase();
  return /sales|force|^sf$|\bsf\b/.test(t) ? 'Sales Force' : 'Correo';
}

// Invalida la caché del portal para que el index revalide tras un cambio.
function invalidarCachePlantillas_() {
  try { CacheService.getScriptCache().remove('toolsData_v1'); } catch (e) {}
}

/**
 * Crea o actualiza una plantilla en la hoja "Plantillas".
 * @param {Object} payload { id?, titulo, tipo, asunto, cuerpo, consideraciones }
 * @return {Object} { status, id } | { status:'error', error }
 */
function guardarPlantilla(payload) {
  try {
    if (!payload || !payload.titulo || !String(payload.titulo).trim())
      throw new Error('El título es obligatorio.');
    if (!payload.cuerpo || !String(payload.cuerpo).trim())
      throw new Error('El cuerpo es obligatorio.');

    const tipo = pltTipoNormaliza_(payload.tipo);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = plantillasSheet_(ss, true);
    ensurePlantillaIdCol_(sheet);
    const width = sheet.getLastColumn();
    const c = plantillasCols_(sheet.getRange(1, 1, 1, width).getValues()[0]);

    const id = payload.id && String(payload.id).trim()
      ? String(payload.id).trim()
      : 'plt-' + Date.now().toString(36);

    const rowValues = [];
    rowValues[c.id]              = id;
    rowValues[c.titulo]          = String(payload.titulo).trim();
    rowValues[c.tipo]            = tipo;
    // El asunto solo aplica a "Correo"; en "Sales Force" se guarda vacío.
    if (c.asunto > -1) rowValues[c.asunto] = tipo === 'Correo' ? String(payload.asunto || '').trim() : '';
    if (c.cuerpo > -1) rowValues[c.cuerpo] = String(payload.cuerpo || '').trim();
    if (c.consideraciones > -1) rowValues[c.consideraciones] = String(payload.consideraciones || '').trim();

    const rowIdx = findAnuncioRow_(sheet, c, id); // genérico: localiza por columna ID
    if (rowIdx > 0) sheet.getRange(rowIdx, 1, 1, width).setValues([fillRow_(rowValues, width)]);
    else sheet.appendRow(fillRow_(rowValues, width));

    invalidarCachePlantillas_();
    return { status: 'ok', id: id };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

/** Devuelve TODAS las plantillas para el sidebar (asigna IDs faltantes). */
function getPlantillasAdmin() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(PLANTILLAS_SHEET);
    if (!sheet) return { status: 'ok', plantillas: [] };
    ensurePlantillaIdCol_(sheet);
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return { status: 'ok', plantillas: [] };
    const c = plantillasCols_(data[0]);
    const out = [];
    let wroteId = false;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const titulo = c.titulo > -1 ? String(row[c.titulo] || '').trim() : '';
      if (!titulo) continue;
      let id = c.id > -1 ? String(row[c.id] || '').trim() : '';
      if (!id && c.id > -1) { // asigna y persiste un ID para poder editar/borrar
        id = 'plt-' + Date.now().toString(36) + '-' + i;
        sheet.getRange(i + 1, c.id + 1).setValue(id);
        wroteId = true;
      }
      out.push({
        id:              id,
        titulo:          titulo,
        tipo:            pltTipoNormaliza_(c.tipo > -1 ? row[c.tipo] : ''),
        asunto:          c.asunto > -1 ? String(row[c.asunto] || '').trim() : '',
        cuerpo:          c.cuerpo > -1 ? String(row[c.cuerpo] || '').trim() : '',
        consideraciones: c.consideraciones > -1 ? String(row[c.consideraciones] || '').trim() : ''
      });
    }
    if (wroteId) invalidarCachePlantillas_();
    return { status: 'ok', plantillas: out };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

function eliminarPlantilla(id) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(PLANTILLAS_SHEET);
    if (!sheet) return { status: 'error', error: 'No existe la hoja Plantillas.' };
    const c = plantillasCols_(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
    const rowIdx = findAnuncioRow_(sheet, c, String(id).trim());
    if (rowIdx < 0) return { status: 'error', error: 'No se encontró la plantilla.' };
    sheet.deleteRow(rowIdx);
    invalidarCachePlantillas_();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}

// ── 4. DATOS DE PROMOCIONES (para Promociones.html) ──────────────────────────

function fetchApplicationData() {
  const cached = cacheGet_('appData_v1');
  if (cached) return cached;
  const data = buildApplicationData_();
  if (data.status === 'success') cachePut_('appData_v1', data);
  return data;
}

function buildApplicationData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const response = {
    promociones: [],
    eventos: [],
    status: 'success',
    error: null
  };

  try {
    // Hoja: Promociones
    const sheetPromos = ss.getSheetByName('Promociones');
    if (sheetPromos) {
      const data = sheetPromos.getDataRange().getValues();
      const headers = data[0].map(h => h.toString().toLowerCase().trim());

      const idxDir  = headers.indexOf('direccion') > -1 ? headers.indexOf('direccion') : headers.findIndex(h => h.includes('direcci'));
      const idxBan  = headers.findIndex(h => h.includes('banner / carrusel'));
      const idxPro  = headers.findIndex(h => h.includes('promoción 2026'));
      const idxDesc = headers.findIndex(h => h.includes('desc mkp'));
      const idxMarca= headers.findIndex(h => h.includes('marca'));
      const idxVig  = headers.findIndex(h => h.includes('vigencia'));
      const idxLiga = headers.findIndex(h => h.includes('liga'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[idxDir] && !row[idxBan]) continue;
        response.promociones.push({
          origen:    'Promociones',
          direccion: row[idxDir]  || '',
          categoria: row[idxBan]  || '',
          promocion: row[idxPro]  || row[idxDesc] || '',
          marca:     idxMarca > -1 ? row[idxMarca] : '',
          vigencia:  row[idxVig]  || '',
          liga:      row[idxLiga] || '#'
        });
      }
    }

    // Hoja: MKP (Marketplace)
    const sheetMKP = ss.getSheetByName('MKP');
    if (sheetMKP) {
      const dataMKP = sheetMKP.getDataRange().getValues();
      const headersMKP = dataMKP[0].map(h => h.toString().toLowerCase().trim());

      const idxDirMKP = headersMKP.findIndex(h => h.includes('direcci'));
      const idxBanMKP = headersMKP.findIndex(h => h.includes('banner / carrusel'));
      const idxProMKP = headersMKP.findIndex(h => h === 'promoción' || h === 'promocion');
      const idxProMkt = headersMKP.findIndex(h => h.includes('promoción mktplace'));
      const idxVigMKP = headersMKP.findIndex(h => h.includes('vigencia'));
      const idxLigaMKP= headersMKP.findIndex(h => h.includes('liga'));

      for (let i = 1; i < dataMKP.length; i++) {
        const row = dataMKP[i];
        if (!row[idxDirMKP] && !row[idxBanMKP]) continue;
        response.promociones.push({
          origen:    'Marketplace',
          direccion: row[idxDirMKP] || '',
          categoria: row[idxBanMKP] || '',
          promocion: row[idxProMkt] || row[idxProMKP] || '',
          marca:     'Marketplace',
          vigencia:  row[idxVigMKP] || '',
          liga:      row[idxLigaMKP] || '#'
        });
      }
    }

    // Google Calendar
    const calendarId = 'liverpool.com.mx_7vl69nu0ep7fp5mkn36bjejheg@group.calendar.google.com';
    try {
      const cal = CalendarApp.getCalendarById(calendarId);
      if (cal) {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 90);

        const events = cal.getEvents(start, futureDate);
        response.eventos = events.map(e => ({
          titulo:      e.getTitle(),
          inicio:      e.getStartTime().getTime(),
          fin:         e.getEndTime().getTime(),
          esTodoElDia: e.isAllDayEvent(),
          descripcion: e.getDescription(),
          ubicacion:   e.getLocation()
        }));
      }
    } catch (calError) {
      Logger.log('Error de Calendario: ' + calError);
    }

  } catch (error) {
    response.status = 'error';
    response.error = error.toString();
    Logger.log(error);
  }

  return response;
}

// ── 5. CONTADORES DE PROMOS (widget del dashboard en Index.html) ─────────────

function fetchPromoCounts() {
  try {
    const data = fetchApplicationData(); // ya cacheado
    const now = new Date();
    let activas = 0, porTerminar = 0;

    (data.promociones || []).forEach(function (p) {
      const r = parseVigencia_(p.vigencia, now);
      if (r && now >= r.start && now <= r.end) {
        activas++;
        if ((r.end - now) / 86400000 <= 3) porTerminar++;
      }
    });

    return { status: 'ok', activas: activas, porTerminar: porTerminar };
  } catch (error) {
    return { status: 'error', error: error.toString(), activas: 0, porTerminar: 0 };
  }
}

// Mismo formato de vigencia que interpreta Promociones.html ("3 al 15 de junio", "10 de mayo"…)
function parseVigencia_(vigenciaStr, now) {
  if (!vigenciaStr) return null;
  const s = String(vigenciaStr).toLowerCase();
  const year = now.getFullYear();

  let m = s.match(/(\d{1,2})\s*(?:de\s+)?([a-záéíóú]+)?\s*(?:al?|hasta(?:\s+el)?|[-–—])\s*(\d{1,2})\s*(?:de\s+)?([a-záéíóú]+)/i);
  if (m) {
    const d1 = parseInt(m[1]), d2 = parseInt(m[3]);
    let mi2 = monthIdx_(m[4]), mi1 = monthIdx_(m[2]);
    if (mi2 === undefined && mi1 !== undefined) mi2 = mi1;
    if (mi1 === undefined && mi2 !== undefined) mi1 = (d1 <= d2) ? mi2 : (mi2 + 11) % 12;
    if (mi1 !== undefined && mi2 !== undefined) {
      const y2 = (mi2 < mi1) ? year + 1 : year;
      return { start: new Date(year, mi1, d1, 0, 0, 0), end: new Date(y2, mi2, d2, 23, 59, 59) };
    }
  }
  m = s.match(/(\d{1,2})\s*(?:de\s+)?([a-záéíóú]+)/i);
  if (m) {
    const mi = monthIdx_(m[2]);
    if (mi !== undefined) {
      const d = parseInt(m[1]);
      return { start: new Date(year, mi, d, 0, 0, 0), end: new Date(year, mi, d, 23, 59, 59) };
    }
  }
  return null;
}

function monthIdx_(name) {
  if (!name) return undefined;
  const pref = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const n = String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (let i = 0; i < 12; i++) if (n.indexOf(pref[i]) === 0) return i;
  return undefined;
}

// ── 6. REPORTE DE ENLACES CAÍDOS (botón "Reportar" en las tarjetas) ───────────

function reportBrokenLink(report) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Reportes');
    if (!sheet) {
      sheet = ss.insertSheet('Reportes');
      sheet.appendRow(['Fecha', 'Sección', 'Nombre', 'Enlace', 'Usuario']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    let user = '';
    try { user = Session.getActiveUser().getEmail(); } catch (e) {}
    sheet.appendRow([
      new Date(),
      String((report && report.seccion) || ''),
      String((report && report.nombre) || ''),
      String((report && report.enlace) || ''),
      user
    ]);
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.toString() };
  }
}
