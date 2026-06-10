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

// ── 2. DATOS DEL PORTAL (Herramientas, Presentaciones, Paqueterías, Formatos, PdePago) ──

function fetchToolsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const response = {
    herramientas: [],
    presentaciones: [],
    paqueterias: [],
    formatos: [],
    pdePago: [],
    status: 'ok',
    error: null
  };

  try {

    // ── Hoja: Herramientas ──
    // Columnas: Nombre | Enlace | Como acceder | Descripcion | Claves
    const sheetH = ss.getSheetByName('Herramientas');
    if (sheetH) {
      const data = sheetH.getDataRange().getValues();
      const hdr = data[0].map(h => h.toString().toLowerCase().trim());
      const iNombre   = hdr.findIndex(h => h.includes('nombre'));
      const iEnlace   = hdr.findIndex(h => h.includes('enlace') || h.includes('liga') || h.includes('link') || h.includes('url'));
      const iAcceder  = hdr.findIndex(h => h.includes('acceder') || h.includes('acceso') || h.includes('como'));
      const iDesc     = hdr.findIndex(h => h.includes('descrip'));
      const iClaves   = hdr.findIndex(h => h.includes('clave'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[iNombre] || !row[iNombre].toString().trim()) continue;
        response.herramientas.push({
          nombre:     String(row[iNombre]  || '').trim(),
          enlace:     iEnlace  > -1 ? String(row[iEnlace]  || '').trim() : '',
          comoAcceder:iAcceder > -1 ? String(row[iAcceder] || '').trim() : '',
          descripcion:iDesc    > -1 ? String(row[iDesc]    || '').trim() : '',
          claves:     iClaves  > -1 ? String(row[iClaves]  || '').trim() : ''
        });
      }
    }

    // ── Hoja: Presentaciones ──
    // Columnas: Nombre | LIGA | DESCRIPCION
    const sheetP = ss.getSheetByName('Presentaciones');
    if (sheetP) {
      const data = sheetP.getDataRange().getValues();
      const hdr = data[0].map(h => h.toString().toLowerCase().trim());
      const iNombre = hdr.findIndex(h => h.includes('nombre'));
      const iLiga   = hdr.findIndex(h => h.includes('liga') || h.includes('enlace') || h.includes('link') || h.includes('url'));
      const iDesc   = hdr.findIndex(h => h.includes('descrip'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[iNombre] || !row[iNombre].toString().trim()) continue;
        response.presentaciones.push({
          nombre:      String(row[iNombre] || '').trim(),
          liga:        iLiga > -1 ? String(row[iLiga] || '').trim() : '',
          descripcion: iDesc > -1 ? String(row[iDesc] || '').trim() : ''
        });
      }
    }

    // ── Hoja: Paqueterias ──
    // Columnas: Nombre | Liga | Soms
    const sheetPaq = ss.getSheetByName('Paqueterias');
    if (sheetPaq) {
      const data = sheetPaq.getDataRange().getValues();
      const hdr = data[0].map(h => h.toString().toLowerCase().trim());
      const iNombre = hdr.findIndex(h => h.includes('nombre'));
      const iLiga   = hdr.findIndex(h => h.includes('liga') || h.includes('enlace') || h.includes('link') || h.includes('url'));
      const iSoms   = hdr.findIndex(h => h.includes('soms') || h.includes('sistema'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[iNombre] || !row[iNombre].toString().trim()) continue;
        response.paqueterias.push({
          nombre: String(row[iNombre] || '').trim(),
          liga:   iLiga > -1 ? String(row[iLiga] || '').trim() : '',
          soms:   iSoms > -1 ? String(row[iSoms] || '').trim() : ''
        });
      }
    }

    // ── Hoja: Formatos ──
    // Columnas: ACCESO | OBSERVACIONES | LIGA
    const sheetF = ss.getSheetByName('Formatos');
    if (sheetF) {
      const data = sheetF.getDataRange().getValues();
      const hdr = data[0].map(h => h.toString().toLowerCase().trim());
      const iAcceso = hdr.findIndex(h => h.includes('acceso') || h.includes('nombre') || h.includes('formato'));
      const iObs    = hdr.findIndex(h => h.includes('observ') || h.includes('nota'));
      const iLiga   = hdr.findIndex(h => h.includes('liga') || h.includes('enlace') || h.includes('link'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[iAcceso] || !row[iAcceso].toString().trim()) continue;
        response.formatos.push({
          acceso:        String(row[iAcceso] || '').trim(),
          observaciones: iObs  > -1 ? String(row[iObs]  || '').trim() : '',
          liga:          iLiga > -1 ? String(row[iLiga] || '').trim() : ''
        });
      }
    }

    // ── Hoja: PdePago ──
    // Columnas: Nombre | Detalles | Liga
    const sheetPP = ss.getSheetByName('PdePago');
    if (sheetPP) {
      const data = sheetPP.getDataRange().getValues();
      const hdr = data[0].map(h => h.toString().toLowerCase().trim());
      const iNombre   = hdr.findIndex(h => h.includes('nombre'));
      const iDetalles = hdr.findIndex(h => h.includes('detalle') || h.includes('descrip') || h.includes('info'));
      const iLiga     = hdr.findIndex(h => h.includes('liga') || h.includes('enlace') || h.includes('link') || h.includes('simulad'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[iNombre] || !row[iNombre].toString().trim()) continue;
        response.pdePago.push({
          nombre:   String(row[iNombre]   || '').trim(),
          detalles: iDetalles > -1 ? String(row[iDetalles] || '').trim() : '',
          liga:     iLiga     > -1 ? String(row[iLiga]     || '').trim() : ''
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

// ── 3. DATOS DE PROMOCIONES (para Promociones.html) ──────────────────────────

function fetchApplicationData() {
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
