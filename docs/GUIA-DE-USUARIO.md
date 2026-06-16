# 📘 Guía del Portal Ventel — explicada fácil

> Este documento está escrito para **cualquier persona**, sin importar si sabe
> de programación. Explica qué es el portal, qué puedes hacer en él y de dónde
> saca la información que muestra.

---

## 1. ¿Qué es el Portal Ventel?

El **Portal Ventel** es una página web interna para el equipo de asesores de
Liverpool · VENTEL. Su objetivo es muy simple: **tener todo en un solo lugar**.

En lugar de andar buscando enlaces, sistemas, claves, formatos o plantillas de
correo en mil lugares diferentes (correos, chats, hojas de cálculo, capturas de
pantalla…), el portal **junta todo en una sola pantalla**, ordenado y con un
buscador para encontrar lo que necesitas en segundos.

Piénsalo como el **“tablero de control”** del asesor: entras, ves tus accesos
rápidos, los avisos del día, las promociones activas, y desde ahí llegas a
cualquier herramienta con un clic.

---

## 2. ¿Qué puedes hacer en el portal?

Aquí está todo lo que ofrece, sección por sección:

### 🏠 Inicio (el tablero)
Es la primera pantalla que ves. Te muestra:
- Un **saludo** y un **reloj** con la fecha y hora actual.
- **Anuncios del equipo**: avisos importantes que publican los supervisores.
- **Hoy en promociones**: cuántas promociones están activas y cuántas están por
  terminar (en 3 días o menos), con acceso directo al Monitor de Promociones.
- **Tus accesos rápidos**: las herramientas que más usas, ordenadas
  automáticamente según tu propio uso. Puedes **fijar** las más importantes con
  un “pin” (un alfiler) para que siempre estén arriba.
- **Guías operativas**: atajos a las explicaciones de formas de pago.

### 🧰 Herramientas
La lista de todas las plataformas y sistemas del equipo. Cada herramienta
muestra su **nombre**, **cómo acceder**, una **descripción** y sus **claves** si
las tiene. Tiene su propio buscador para filtrar.

### 📦 Paqueterías
Te dice **cómo aparece cada paquetería en el sistema SOMS** y te da el enlace a
su portal de rastreo.

### 💳 Formas de Pago
Una **guía visual** (siempre disponible, no cambia) que explica paso a paso:
pago en efectivo, transferencia BBVA, datos fiscales, monedero, FBL5N y
prevención de fraudes. Puedes **tocar cualquier dato** (como una CLABE, un
convenio o un RFC) para **copiarlo** al instante.

### 🌐 Pago Web
Las promociones de pago disponibles en la plataforma, explicadas, con
simuladores de referencia.

### 📑 Otras secciones de guía
Big Ticket, Soft Line, SL Mensajerías, MarketPlace, Tienda, Generales y
Devoluciones SAP: guías y accesos organizados por tipo de operación.

### 📋 Formatos
Los documentos y formularios que se usan en la operación, con sus
**observaciones importantes** y el enlace para abrirlos.

### ✉️ Plantillas
Plantillas listas para **correo** y para **Salesforce**. Lo más útil:
- Puedes **copiar** el asunto, el cuerpo o todo de un solo clic.
- En el texto, las partes que van entre corchetes `[ así ]` se convierten en
  **campos que tú llenas** dentro de la tarjeta. Al copiar, se reemplazan por lo
  que escribiste.
- Si la plantilla menciona correos de **copia obligatoria o escalamiento**, el
  portal los detecta solos y te los ofrece para copiarlos.

### 📊 Presentaciones
Material de apoyo y presentaciones del equipo, con su descripción y enlace.

### 📈 Monitor de Promociones (página aparte)
Una vista dedicada a las promociones vigentes (de Liverpool y de Marketplace) y
a un **calendario de eventos**. Te dice qué está activo, qué viene y cuándo
termina cada cosa.

### 🔎 Buscador general
Arriba del portal hay un buscador que **busca en todo a la vez**: herramientas,
formatos, plantillas, paqueterías, etc. Es “inteligente”: encuentra resultados
aunque escribas con errores de dedo o solo una parte del nombre.

### 🚩 Reportar enlaces caídos
Cada tarjeta tiene un botón para **avisar si un enlace ya no funciona**. Ese
reporte queda registrado para que el equipo lo arregle.

---

## 3. ¿De dónde saca los datos el portal?

Esta es la parte clave para entender cómo “se alimenta” el portal. **Casi toda
la información vive en una hoja de cálculo de Google Sheets.** El portal no
guarda los datos por su cuenta: los **lee de la hoja** cada vez.

Esto significa que para **agregar, cambiar o quitar** algo (una herramienta, un
formato, una plantilla…), **no se toca programación**: solo se edita la hoja de
cálculo. El portal se actualiza solo.

Las fuentes de datos son:

| Lo que ves en el portal | De dónde sale |
|---|---|
| Herramientas | Hoja **Herramientas** |
| Paqueterías | Hoja **Paqueterias** |
| Pago Web | Hoja **PdePago** |
| Formatos | Hoja **Formatos** |
| Presentaciones | Hoja **Presentaciones** |
| Plantillas de correo/Salesforce | Hoja **Plantillas** |
| Anuncios del equipo | Hoja **Anuncios** (y la vieja hoja **Avisos**) |
| Promociones | Hojas **Promociones** y **MKP** |
| Calendario de eventos | Un **Google Calendar** del equipo |
| Reportes de enlaces caídos | Hoja **Reportes** (se crea sola) |

> 💡 En resumen: **la hoja de cálculo es el “panel de administración”.** Quien
> tenga permiso de editar la hoja, administra el portal.

---

## 4. ¿Cómo se publican anuncios y plantillas?

No hace falta editar la hoja a mano para esto. Desde la propia hoja de cálculo
aparecen dos menús especiales arriba:

- **📢 Anuncios → Abrir constructor…**: abre un panel lateral donde el
  supervisor arma el anuncio con **vista previa en vivo** y elige el formato:
  - **Banner descartable**: un aviso de texto que el asesor puede cerrar.
  - **Banner destacado fijo**: una tarjeta fija al inicio, con botón opcional.
  - **Tarjeta con imagen**: una publicación visual con imagen y botón de enlace.
  - **Modal de bienvenida**: una ventanita emergente que aparece una vez.
  Cada anuncio puede tener fecha de **inicio** y de **fin**, para programarlo.

- **✉️ Plantillas → Abrir constructor…**: abre un panel para crear y editar
  plantillas, también con vista previa, botón para insertar campos `[…]` y la
  lista de plantillas existentes (editar, duplicar o borrar).

Todo lo que se guarda desde estos paneles **se escribe en la hoja de cálculo** y
aparece en el portal automáticamente.

---

## 5. ¿Por qué el portal abre tan rápido?

El portal usa un truco para sentirse instantáneo:

1. La **primera vez** que abres, lee los datos de la hoja y los guarda
   temporalmente (en el navegador y en el servidor).
2. La **siguiente vez**, te muestra de inmediato lo que ya tenía guardado
   (no esperas nada) y, **en segundo plano**, revisa si hay algo nuevo y lo
   actualiza sin que lo notes.

Por eso casi nunca ves “cargando”. Además, tus **preferencias** (qué temas usas,
qué herramientas fijaste, cuáles usas más) se guardan **en tu propio navegador**,
así que el portal se adapta a ti sin pedirte configurar nada.

---

## 6. Preguntas frecuentes

**¿Necesito instalar algo?**
No. Es una página web; se abre con un enlace en el navegador.

**¿Mis cambios afectan a los demás?**
Tus preferencias (pines, temas, accesos rápidos) son **solo tuyas**. Lo que sí
ven todos es lo que está en la hoja de cálculo (herramientas, anuncios, etc.).

**Cambié algo en la hoja y no lo veo en el portal. ¿Por qué?**
El portal guarda los datos por un ratito para ir rápido. Usa el botón de
**actualizar** (🔄) en el inicio, o espera unos minutos y recarga.

**Un enlace ya no funciona, ¿qué hago?**
Usa el botón de **reportar** en esa tarjeta. El equipo lo recibe y lo corrige.

---

📎 ¿Quieres el detalle técnico? Mira:
- [`ARQUITECTURA-TECNICA.md`](./ARQUITECTURA-TECNICA.md) — cómo está construido.
- [`REFERENCIA-DE-DATOS.md`](./REFERENCIA-DE-DATOS.md) — las hojas y sus columnas.
