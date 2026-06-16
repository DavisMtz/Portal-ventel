# 📢 Manual de publicaciones — Supervisión y Team Leaders

> Manual práctico, paso a paso, para **publicar anuncios** en el Portal Ventel.
> No necesitas saber de programación: todo se hace desde un panel con **vista
> previa en vivo**. Aquí aprenderás a abrir el constructor, qué tipo de
> publicación elegir, cómo se comporta cada una y cómo administrarlas.

---

## 1. ¿Qué es una publicación (anuncio)?

Un **anuncio** es un mensaje que aparece en la pantalla de **Inicio** del portal
para todo el equipo: un aviso, una promoción, un recordatorio importante, etc.

Tú decides:
- **Qué dice** (texto, imagen, botones).
- **Cómo se ve** (el formato y el color/tono).
- **Cuándo aparece y cuándo desaparece** (fechas de inicio y fin).
- **En qué orden** se muestra respecto a otros anuncios.

Todo lo que publiques se guarda automáticamente y aparece en el portal de los
asesores. No tienes que avisar a nadie ni tocar código.

---

## 2. Cómo abrir el constructor

1. Abre la **hoja de cálculo** del Portal Ventel (la base de datos del portal).
2. En la barra de menús de arriba, haz clic en **📢 Anuncios**.
3. Elige **«Abrir constructor…»**.
4. Se abre un **panel lateral** a la derecha: ese es el Constructor de Anuncios.

> 💡 Si no ves el menú **📢 Anuncios**, recarga la hoja y espera unos segundos
> (aparece solo al abrir). Necesitas permiso de **edición** sobre la hoja.

El panel tiene tres partes, de arriba abajo:
- **Vista previa**: muestra en vivo cómo se verá tu anuncio mientras lo armas.
- **Formulario**: donde eliges el formato y escribes el contenido.
- **Publicaciones existentes**: la lista de todo lo ya publicado, para
  administrarlo.

---

## 3. Los 4 tipos de publicación

Lo primero que eliges es el **Formato**. Hay cuatro, cada uno con un
comportamiento distinto:

### 🟦 Banner — *aviso descartable*
Una barra de texto delgada arriba del Inicio. Es lo más sencillo y discreto.
- **El asesor puede cerrarlo** (y no le vuelve a aparecer).
- Ideal para: avisos rápidos, recordatorios cortos del día.
- **Campos**: Tono/color + Mensaje.

### 🟪 Destacado — *fijo al inicio*
Una tarjeta más vistosa que se queda fija arriba (no se puede cerrar).
- Ideal para: información importante que todos deben ver sí o sí.
- **Campos**: Tono + Título + Ícono + Cuerpo + botones opcionales.

### 🟨 Tarjeta — *imagen + botón*
Una publicación visual, con imagen, pensada para promociones o campañas.
- Ideal para: promos con imagen, campañas, novedades atractivas.
- **Campos**: Tono + Título + Descripción + Imagen + Vigencia (texto) + botones.

### 🟩 Modal — *pop-up de inicio*
Una ventana emergente que aparece **una vez** cuando el asesor entra.
- Ideal para: comunicados de bienvenida o algo que no quieres que pase desapercibido.
- **Campos**: Título + Cuerpo + Imagen + botones opcionales.

> El formulario **cambia solo** según el formato que elijas: solo verás los
> campos que ese tipo necesita.

---

## 4. Los campos, explicados

Según el formato verás algunos de estos campos:

| Campo | Para qué sirve | Aparece en |
|---|---|---|
| **Tono / color** | El color del mensaje: Info (azul), Aviso (naranja), Urgente (rojo), Éxito (verde) | Banner, Destacado, Tarjeta |
| **Mensaje** | El texto del banner | Banner |
| **Título** | El encabezado de la publicación | Destacado, Tarjeta, Modal |
| **Ícono** | Un emoji/símbolo decorativo (megáfono, rayo, bandera…) | Destacado |
| **Cuerpo** | El texto principal del anuncio | Destacado, Modal |
| **Descripción** | Un texto corto bajo el título | Tarjeta |
| **Imagen** | La imagen de la publicación (ver sección 5) | Tarjeta, Modal |
| **Vigencia (texto)** | Una etiqueta de fechas que se *muestra* (ej. «3 al 15 de junio») | Tarjeta |
| **Botón principal** | Texto + enlace de un botón (call to action) | Destacado, Tarjeta, Modal |
| **Botón secundario** | Un segundo botón opcional | Destacado, Tarjeta, Modal |

**Sobre el color/tono:** úsalo con criterio para que el equipo lo entienda de un
vistazo:
- 🔵 **Info** → informativo, neutral.
- 🟠 **Aviso** → algo a lo que poner atención.
- 🔴 **Urgente** → crítico, requiere acción inmediata.
- 🟢 **Éxito** → buenas noticias, confirmaciones.

**Contadores de caracteres:** algunos campos muestran un contador (ej. `0/140`).
Es una **sugerencia** para que el texto se vea bien; si te pasas, no se bloquea,
pero puede verse cortado o muy largo.

**Sobre los botones (Vigencia texto vs. fechas reales):** ojo con esta
diferencia importante:
- **«Vigencia (texto)»** es solo una **etiqueta visible** (lo que lee el asesor).
  No controla cuándo desaparece el anuncio.
- Las fechas **«Publicar desde»** y **«Expira»** (sección 6) son las que de
  verdad controlan cuándo aparece y se oculta.

---

## 5. Cómo poner una imagen (Tarjeta y Modal)

Tienes dos maneras:

**Opción A — Subir desde tu computadora (recomendada):**
1. Haz clic en **«Seleccionar archivo»** en el campo Imagen.
2. Elige la imagen. El panel la **sube sola a Google Drive** (a la carpeta
   «Portal Ventel») y la deja lista.
3. Verás **«✓ Imagen subida a Drive»** y aparecerá en la vista previa.

**Opción B — Pegar una URL pública:**
- Si ya tienes la imagen en internet, pega su dirección (`https://…`) en el campo
  de URL.

> 📏 **Consejo:** la imagen se ajusta automáticamente (máx. 1200 px) para que
> cargue rápido. El límite es **8 MB**. Usa imágenes horizontales: se ven mejor.

---

## 6. Cuándo aparece y cuándo desaparece (programación)

Estos controles deciden la **vigencia real** del anuncio:

- **Publicar desde**: la fecha en que empieza a mostrarse.
  - Si lo dejas **vacío**, se publica **de inmediato**.
  - Si pones una fecha **futura**, queda **programado**: no se ve hasta ese día.
- **Expira**: la fecha en que deja de mostrarse.
  - Si lo dejas **vacío**, **no caduca** (sigue hasta que lo ocultes o borres).
  - El anuncio se ve durante **todo el día** de la fecha de expiración; recién al
    día siguiente desaparece.
- **Orden**: el número que define la posición. **Menor número = más arriba.**
  También puedes reordenar con las flechas ↑/↓ en la lista (sección 8).
- **Publicar activo** (casilla): si está marcada, se publica visible. Si la
  desmarcas, se guarda pero **oculto** (útil para dejar algo listo y activarlo
  después).

> 🗓️ **Ejemplo:** quieres una promo visible del 20 al 30 de junio →
> «Publicar desde» = 20/06, «Expira» = 30/06, casilla **activa**. El portal la
> mostrará sola ese rango y la ocultará al terminar.

---

## 7. Publicar paso a paso

1. Elige el **Formato**.
2. Elige el **Tono** (si aplica) y llena los **campos**.
3. Revisa la **Vista previa** arriba (puedes alternar 🌙 oscuro / ☀️ claro para
   ver cómo luce en cada tema del portal).
4. Ajusta **fechas**, **orden** y la casilla **activo**.
5. Haz clic en **«Publicar anuncio»**.
6. Verás **«✓ Publicado correctamente»**. ¡Listo! Ya aparece en el portal.

> Si falta algo obligatorio, el panel te avisa: el **banner** necesita Mensaje;
> los demás formatos necesitan **Título**.

---

## 8. Administrar lo publicado

Abajo, en **«Publicaciones existentes»**, está la lista de todo lo que existe.
Cada renglón muestra el **formato**, un **estado** de color y su título, con estos
botones:

| Botón | Qué hace |
|---|---|
| **Editar** | Carga el anuncio en el formulario para modificarlo. Al guardar, se actualiza el mismo |
| **Duplicar** | Crea una **copia** lista para ajustar y publicar como nueva (no pisa la original) |
| **↑ / ↓** | Sube o baja el anuncio (cambia el orden de aparición) |
| **Ocultar / Activar** | Apaga o enciende la publicación sin borrarla |
| **Borrar** | Elimina la publicación de forma permanente (pide confirmación) |

**Los estados que verás:**
- 🟢 **Activo** — se está mostrando ahora.
- 🔵 **Programado** — tiene fecha «desde» a futuro; aún no aparece.
- 🟠 **Expirado** — ya pasó su fecha de «expira»; dejó de mostrarse.
- ⚪ **Oculto** — está desactivado (casilla «activo» apagada).

> Para **editar**: haz clic en «Editar», cambia lo que quieras y pulsa **«Guardar
> cambios»**. Para salir sin guardar, usa **«Cancelar edición»**.

---

## 9. Buenas prácticas

- **Uno claro, no muchos a la vez.** Demasiados anuncios cansan; prioriza con el
  orden y oculta lo que ya no aplica.
- **Pon fecha de expiración** a lo temporal (promos, eventos). Así no se queda un
  aviso viejo colgado.
- **Usa el tono correcto.** Reserva el rojo «Urgente» para lo verdaderamente
  crítico; si todo es urgente, nada lo es.
- **Revisa la vista previa** en oscuro y claro antes de publicar.
- **Duplica en vez de rehacer.** Si un anuncio se parece a otro anterior,
  duplícalo y ajústalo.
- **Títulos cortos y directos.** Respeta los contadores sugeridos.
- **Oculta, no borres**, si quizá lo vuelvas a usar. Borrar es permanente.

---

## 10. Preguntas frecuentes

**Publiqué algo y no lo veo en el portal.**
El portal guarda los datos unos minutos para ir rápido. Usa el botón de
**actualizar (🔄)** en el Inicio del portal o espera unos minutos y recarga.

**¿Quién puede publicar?**
Cualquiera con permiso de **edición** sobre la hoja de cálculo. Queda registrado
quién publicó cada anuncio.

**Cerré un banner como asesor para probar y ya no me aparece.**
Es normal: los banners y modales se **descartan por persona**. Para volver a
verlo tendrías que limpiar los datos del navegador o probar en otro perfil.

**¿Puedo dejar algo listo para publicar después?**
Sí: arma el anuncio y **desmarca «Publicar activo»** (o pon una fecha «desde» a
futuro). Cuando llegue el momento, lo activas.

**¿Las fechas usan mi zona horaria?**
Sí; el portal interpreta las fechas en la zona horaria configurada del sistema, y
el anuncio se mantiene visible todo el día de su fecha de expiración.

---

📎 Documentos relacionados:
- [`GUIA-DE-USUARIO.md`](./GUIA-DE-USUARIO.md) — cómo se ve el portal del lado del asesor.
- [`REFERENCIA-DE-DATOS.md`](./REFERENCIA-DE-DATOS.md) — detalle técnico de la hoja «Anuncios» y los formatos JSON.
