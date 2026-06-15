/**
 * @fileoverview Controlador principal de Google Apps Script.
 * Sirve la interfaz web y expone las APIs internas para la recuperación de datos.
 *
 * Páginas disponibles:
 *   /           → Portal principal (Index.html)
 *   /?page=promociones → Monitor de promociones (Promociones.html)
 */

// ── 1. ROUTING Y RENDERIZADO ──────────────────────────────────────────────────

// Favicon (isotipo Liverpool): se define como <link rel="icon"> dentro del <head>
// de Index.html / Promociones.html. No se usa HtmlOutput.setFaviconUrl() porque ese
// método solo acepta una URL pública a un archivo de imagen real (PNG/ICO) y rechaza
// los SVG y los data URI ("tipo de imagen de icono de página no admitido").

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'portal';
  var appUrl = ScriptApp.getService().getUrl();
  var isPromos = (page === 'promociones');

  var template = HtmlService.createTemplateFromFile(isPromos ? 'Promociones' : 'Index');
  template.APP_URL = appUrl;

  return template.evaluate()
    .setTitle(isPromos ? 'Monitor de Promociones | Liverpool · VENTEL' : 'Portal VENTEL · Liverpool')
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
