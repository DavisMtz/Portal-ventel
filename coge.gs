/**
 * @fileoverview Controlador principal de Google Apps Script.
 * Sirve la interfaz web y expone las APIs internas para la recuperación de datos.
 */

// 1. Inicialización y Renderizado de la Interfaz Web
function doGet(e) {
  const html = HtmlService.createTemplateFromFile('Index');
  return html.evaluate()
      .setTitle('Monitor de Promociones | Liverpool')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 2. Extracción y Normalización de Datos (Google Sheets)
function fetchApplicationData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const response = {
    promociones: [],
    eventos: [],
    status: 'success',
    error: null
  };

  try {
    // --- Lógica para hoja "Promociones" ---
    const sheetPromos = ss.getSheetByName('Promociones');
    if (sheetPromos) {
      const data = sheetPromos.getDataRange().getValues();
      const headers = data[0].map(h => h.toString().toLowerCase().trim());
      
      // Búsqueda difusa de índices para evitar errores por saltos de línea
      const idxDir = headers.indexOf('direccion') > -1 ? headers.indexOf('direccion') : headers.findIndex(h => h.includes('direcci'));
      const idxBan = headers.findIndex(h => h.includes('banner / carrusel'));
      const idxPro = headers.findIndex(h => h.includes('promoción 2026'));
      const idxDesc = headers.findIndex(h => h.includes('desc mkp'));
      const idxMarca = headers.findIndex(h => h.includes('marca'));
      const idxVig = headers.findIndex(h => h.includes('vigencia'));
      const idxLiga = headers.findIndex(h => h.includes('liga'));

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[idxDir] && !row[idxBan]) continue; // Omitir filas vacías
        
        response.promociones.push({
          origen: 'Promociones',
          direccion: row[idxDir] || '',
          categoria: row[idxBan] || '',
          promocion: row[idxPro] || row[idxDesc] || '',
          marca: idxMarca > -1 ? row[idxMarca] : '',
          vigencia: row[idxVig] || '',
          liga: row[idxLiga] || '#'
        });
      }
    }

    // --- Lógica para hoja "MKP" ---
    const sheetMKP = ss.getSheetByName('MKP');
    if (sheetMKP) {
      const dataMKP = sheetMKP.getDataRange().getValues();
      const headersMKP = dataMKP[0].map(h => h.toString().toLowerCase().trim());
      
      const idxDirMKP = headersMKP.findIndex(h => h.includes('direcci'));
      const idxBanMKP = headersMKP.findIndex(h => h.includes('banner / carrusel'));
      const idxProMKP = headersMKP.findIndex(h => h === 'promoción' || h === 'promocion');
      const idxProMkt = headersMKP.findIndex(h => h.includes('promoción mktplace'));
      const idxVigMKP = headersMKP.findIndex(h => h.includes('vigencia'));
      const idxLigaMKP = headersMKP.findIndex(h => h.includes('liga'));

      for (let i = 1; i < dataMKP.length; i++) {
        const row = dataMKP[i];
        if (!row[idxDirMKP] && !row[idxBanMKP]) continue; 
        
        response.promociones.push({
          origen: 'Marketplace',
          direccion: row[idxDirMKP] || '',
          categoria: row[idxBanMKP] || '',
          promocion: row[idxProMkt] || row[idxProMKP] || '',
          marca: 'Marketplace', // No hay columna marca, identificamos por origen
          vigencia: row[idxVigMKP] || '',
          liga: row[idxLigaMKP] || '#'
        });
      }
    }

    // --- Lógica para Google Calendar ---
    const calendarId = 'liverpool.com.mx_7vl69nu0ep7fp5mkn36bjejheg@group.calendar.google.com';
    try {
      const cal = CalendarApp.getCalendarById(calendarId);
      if (cal) {
        const today = new Date();
// Desde el día 1 del mes actual (para ver el mes completo en el cronograma)
const start = new Date(today.getFullYear(), today.getMonth(), 1);
const futureDate = new Date();
futureDate.setDate(today.getDate() + 90); // 90 días para navegar meses adelante

        const events = cal.getEvents(today, futureDate);
        response.eventos = events.map(e => ({
          titulo: e.getTitle(),
          inicio: e.getStartTime().getTime(),
          fin: e.getEndTime().getTime(),
          esTodoElDia: e.isAllDayEvent(),
          descripcion: e.getDescription(),
          ubicacion: e.getLocation() // Nueva propiedad extraída
        }));
      }
    } catch(calError) {
      Logger.log("Error de Calendario: " + calError);
      // Falla silenciosa permitida para el calendario para no bloquear las promociones
    }

  } catch (error) {
    response.status = 'error';
    response.error = error.toString();
    Logger.log(error);
  }

  return response;
}
