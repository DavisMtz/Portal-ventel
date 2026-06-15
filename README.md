# Portal Ventel

## 📌 Descripción General
El **Portal Ventel** es una plataforma centralizada diseñada para optimizar el flujo de trabajo de los asesores. Su objetivo principal es unificar todos los enlaces, herramientas internas y documentos relevantes en una interfaz única, accesible y de alta velocidad. Al consolidar estos recursos, el portal elimina la fragmentación de la información, permitiendo a los usuarios localizar las herramientas necesarias de manera instantánea y eficiente.

---

## 🚀 Características Principales

* **Carga Instantánea (caché en dos capas):** Los datos se cachean 10 minutos en el servidor (`CacheService`) y la última respuesta se guarda en `localStorage`; al abrir, el portal pinta de inmediato con el dato local y revalida contra Apps Script en segundo plano (*stale-while-revalidate*).
* **Accesos Rápidos Personalizados:** El dashboard ordena las herramientas según la frecuencia de uso de cada asesor, y permite fijarlas con un pin. Todo se guarda localmente, sin configuración.
* **Constructor de Anuncios (multi-formato):** Desde la propia hoja de cálculo, el menú **📢 Anuncios → Abrir constructor…** abre un *sidebar* HTML donde los supervisores arman publicaciones con vista previa en vivo y las guardan como **JSON** en la hoja `Anuncios` (columnas: `ID | Formato | Activo | Orden | Hasta | Datos (JSON) | Autor | Creado`). El portal interpreta ese JSON y soporta 4 formatos:
  * **Banner descartable** — aviso de texto con tono `info/warn/alert/ok` que el asesor puede cerrar.
  * **Banner destacado fijo** — tarjeta no descartable al inicio, con título, cuerpo y botón opcional.
  * **Tarjeta con imagen + CTA** — publicación visual con imagen, descripción, vigencia y botón de enlace.
  * **Modal de bienvenida** — pop-up que aparece una vez por sesión hasta cerrarse.
  La columna `Hasta` (fecha) y `Activo` (TRUE/FALSE) controlan la vigencia/visibilidad. La hoja `Avisos` legacy se sigue leyendo como banner para no perder publicaciones anteriores.
* **Plantillas de Correo y Salesforce:** Sección **Plantillas** alimentada por la hoja `Plantillas` (columnas: `Titulo | Tipo | Asunto | Cuerpo | Consideraciones`). El portal interpreta cada fila según su **Tipo**:
  * **Correo** — muestra *Asunto* + *Cuerpo* + *Consideraciones*, con copia rápida del asunto, del cuerpo o de "todo" (asunto + cuerpo).
  * **Sales Force** — muestra solo *Cuerpo* + *Consideraciones* (el asunto se ignora).
  En el *Cuerpo*, cualquier fragmento entre corchetes `[ así ]` se convierte en un **campo editable** dentro de la tarjeta; el texto entre corchetes es la pista (placeholder) y, al **Copiar cuerpo**, se reemplaza por lo que escriba el asesor (si se deja vacío, se conserva `[la pista]`). En *Consideraciones* se ponen las notas y los correos de **copia obligatoria o escalamiento**; el portal detecta automáticamente esos correos y los ofrece como chips para copiarlos. Las plantillas se filtran por tipo (chips Todas/Correo/Salesforce) y aparecen en el **buscador general**.
* **Reporte de Enlaces Caídos:** Cada tarjeta tiene un botón de reporte que registra fecha, sección, nombre, enlace y usuario en una hoja `Reportes` (se crea sola al primer reporte).
* **Historial Real de Navegación:** Las secciones usan `google.script.history`, por lo que el botón "atrás" del navegador funciona y se pueden compartir enlaces directos a una sección.
* **Puente con el Monitor de Promos:** El dashboard muestra cuántas promociones están activas hoy y cuántas terminan en ≤ 3 días, con acceso directo al Monitor.
* **Motor de Búsqueda Avanzado:** Implementación de un sistema de búsqueda potente y de alta precisión. Capaz de realizar consultas mediante coincidencias parciales, palabras clave y metadatos, garantizando que casi cualquier elemento pueda ser encontrado en milisegundos.
* **Filtros Dinámicos:** Categorización inteligente de enlaces e interfaces para refinar los resultados de búsqueda en tiempo real, adaptándose a los distintos requerimientos operativos de los asesores.
* **Interfaz Fluida y Animaciones (GSAP 3.13):** Integración completa de la suite *GreenSock Animation Platform (GSAP)* versión 3.13. Las transiciones de estado, la carga de elementos y las interacciones del DOM están orquestadas para ofrecer una experiencia de usuario (UX) inmersiva, sin sacrificar el rendimiento.
* **Diseño 100% Responsivo:** Arquitectura adaptable que garantiza una visualización clara, usabilidad ergonómica y un diseño intuitivo en cualquier dispositivo o tamaño de pantalla.

---

## 🔬 Análisis Multidisciplinario del Proyecto

### 1. Perspectiva de Ingeniería y Programática
Desde el punto de vista del desarrollo de software, el portal requiere una arquitectura front-end altamente optimizada e integrada de forma nativa con el entorno corporativo.
* **Backend e Infraestructura con Google Apps Script:** La implementación se ejecuta bajo el entorno de Google Apps Script, utilizando `HtmlService` para servir la interfaz web de manera directa y segura. Esta infraestructura permite aprovechar el almacenamiento de datos corporativos (como bases de datos en Google Sheets o repositorios en Google Drive) y consumirlos asíncronamente mediante `google.script.run`. Al funcionar como una API interna sin necesidad de configurar servidores externos dedicados, se garantiza una baja latencia en el intercambio de información y un control de accesos unificado.
* **Algoritmos de Búsqueda:** Para cumplir con el requerimiento de encontrar casi cualquier coincidencia, se procesan los datos en el cliente mediante algoritmos de búsqueda difusa (*Fuzzy Search*) basados en la distancia de Levenshtein. Al estructurar la base de datos de enlaces e índices en un *Hash Map* o árbol de búsqueda (Trie) local en JavaScript, la complejidad temporal de las consultas se reduce a $O(1)$ tras la carga inicial, optimizando el rendimiento y mitigando las peticiones concurrentes al servidor de Apps Script.
* **Rendimiento en el DOM:** El uso de GSAP 3.13 es fundamental para la fluidez de la app responsiva. A diferencia de las animaciones nativas complejas en CSS, GSAP manipula las propiedades de transformación (`transform`) y opacidad (`opacity`) delegando el procesamiento a la GPU del dispositivo. Esto evita el *Reflow* constante del DOM y mantiene la tasa de refresco en 60 fotogramas por segundo (FPS).

### 2. Perspectiva Psicológica (Carga Cognitiva)
El diseño del Portal Ventel aborda directamente la **reducción de la carga cognitiva extrínseca**. Los asesores, al tener que buscar herramientas en plataformas dispersas, sufren de fatiga de decisión.
* **Ley de Hick-Hyman:** El tiempo necesario para tomar una decisión aumenta logarítmicamente con el número y la complejidad de las opciones disponibles. Al centralizar y filtrar los enlaces mediante un buscador claro, el portal minimiza los estímulos irrelevantes. Esto permite que el asesor enfoque su atención y memoria de trabajo en la tarea operativa real, reduciendo el estrés y optimizando los tiempos de respuesta.

### 3. Perspectiva Científica (Interacción Humano-Computadora)
En el campo de la Interacción Humano-Computadora (HCI), este proyecto optimiza la relación señal-ruido en la interfaz de usuario.
* El motor de búsqueda actúa como un filtro de alta frecuencia, donde la "señal" es el documento o enlace exacto que el usuario necesita y el "ruido" representa el resto de las herramientas irrelevantes para ese momento específico.
* **Ergonomía Visual:** La exigencia de una interfaz clara obedece a los principios de la Gestalt aplicados al diseño de software (Proximidad y Similitud). Los elementos agrupados lógicamente y las micro-interacciones orquestadas por GSAP al interactuar con el DOM mejoran la retención espacial de la información, permitiendo una navegación intuitiva y natural.

---

## 🛠️ Stack Tecnológico
* **Ambiente de Servidor / Hosting:** Google Apps Script (`HtmlService`).
* **Lenguajes Core:** HTML5, CSS3, JavaScript (ES6+).
* **Librería de Animación:** GSAP 3.13 (GreenSock).
* **Motor de Búsqueda:** Lógica de búsqueda difusa del lado del cliente (Client-side Fuzzy Search).
* **Maquetación:** CSS Grid / Flexbox con enfoque *Mobile-First* para diseño responsivo.
