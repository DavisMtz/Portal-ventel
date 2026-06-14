/**
 * @fileoverview Controlador principal de Google Apps Script.
 * Sirve la interfaz web y expone las APIs internas para la recuperación de datos.
 *
 * Páginas disponibles:
 *   /           → Portal principal (Index.html)
 *   /?page=promociones → Monitor de promociones (Promociones.html)
 */

// ── 1. ROUTING Y RENDERIZADO ──────────────────────────────────────────────────

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
    avisos: [],
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

    // ── Hoja: Avisos (opcional) ──
    // Columnas: Mensaje | Tipo (info/warn/alert/ok) | Hasta (fecha opcional)
    const sheetA = ss.getSheetByName('Avisos');
    if (sheetA) {
      const data = sheetA.getDataRange().getValues();
      const hdr = data[0].map(h => h.toString().toLowerCase().trim());
      const iMsg   = hdr.findIndex(h => h.includes('mensaje') || h.includes('aviso') || h.includes('texto'));
      const iTipo  = hdr.findIndex(h => h.includes('tipo'));
      const iHasta = hdr.findIndex(h => h.includes('hasta') || h.includes('vigen') || h.includes('fecha'));
      const now = new Date();

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (iMsg < 0 || !row[iMsg] || !row[iMsg].toString().trim()) continue;
        if (iHasta > -1 && row[iHasta] instanceof Date && row[iHasta] < now) continue; // aviso expirado
        response.avisos.push({
          mensaje: String(row[iMsg]).trim(),
          tipo:    iTipo > -1 && row[iTipo] ? String(row[iTipo]).trim().toLowerCase() : 'info'
        });
      }
    }

  } catch (error) {
    response.status = 'error';
    response.error = error.toString();
    Logger.log('fetchToolsData error: ' + error);
  }

  return response;
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
