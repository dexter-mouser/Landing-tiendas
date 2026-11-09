# Genérico — Landing de tiendas

Página pública de la tienda que acompaña al CRM "Genérico": portada, navegación por catálogos, productos destacados y un panel de admin para cargar los productos. Es una plantilla: el mismo código sirve para cada cliente cambiando solo la configuración, los datos y las imágenes.

Diseño basado en los colores del sistema **DOPE** (`../DOPE Desing`) y en la navegación de dope.security: fondo casi negro (`#090909`), texto blanco hueso (`#f7f9fa`), tipografía genérica del sistema operativo (sin descargas) y bordes finos en lugar de sombras.

## Funcionamiento

### 1. Portada
- Ocupa toda la pantalla **a color** con el nombre de la tienda como único titular sobre una foto (`imagenHero`), con un velo oscuro suave para que el texto se lea. Si no hay foto configurada, el fondo es un degradado de color hecho en CSS.
- Foto de ejemplo: `assets/img/portada.jpg`, "Estanterías llenas de varios productos y una bombilla colgante" de Raja Patel en Unsplash (Licencia Unsplash: uso gratuito, también comercial). Se reemplaza por la foto real de cada tienda.
- **Transición al bajar:** la portada queda fija mientras se hace scroll y se va cubriendo de negro hasta fundirse con el fondo de la página; el titular se desvanece y sube. Las filas de catálogos entran por encima mientras se oscurece.
- El progreso (0 arriba, 1 al final) se aplica con la variable CSS `--progreso`; el cálculo se agrupa con `requestAnimationFrame` para no repetirlo en cada evento.
- Con "reducir movimiento" activado, la portada se queda a color y sin efecto.

### 2. Segunda mitad del inicio: catálogos y destacados
- Cada catálogo es una fila ancha en mayúsculas gruesas, con una **flecha →** a la derecha que lleva a su página. Las letras empiezan en contorno y se rellenan una a una a medida que la fila sube por la pantalla.
- Debajo, la sección **Destacados** muestra hasta 8 productos marcados como destacados en el admin que estén disponibles (los agotados u ocultos no se promocionan). Si no hay ninguno, la sección no aparece.
- El menú superior tiene el nombre de la tienda, los mismos catálogos (marca el actual) y un icono de usuario "Iniciar sesión" que abre el panel de admin.

### 3. Catálogos (subpáginas)
- Una sola plantilla `catalogo.html` que se llena según la URL: `catalogo.html?categoria=cocteles`.
- Muestra el nombre del catálogo, su descripción y sus productos (nombre, descripción, precio y un recuadro blanco en lugar de foto). Los agotados se ven atenuados, con el precio tachado y la etiqueta "Agotado"; los ocultos no aparecen.
- **Buscador:** filtra los productos del catálogo por nombre o descripción mientras se escribe, sin importar tildes ni mayúsculas, e indica cuántos coinciden.
- Al final, las filas con flecha de los demás catálogos para seguir navegando.
- Si el catálogo no existe o no tiene productos se ve un aviso con enlace al inicio.

### 4. Carta digital (`carta.html`)
- Todos los productos públicos agrupados por catálogo, en formato de carta de bar: nombre y precio unidos por una línea de puntos, descripción debajo y "Agotado" donde aplique. Los catálogos sin productos visibles no aparecen.
- Botón "Imprimir / PDF": la versión impresa sale en fondo blanco, sin menú y sin cortar productos entre páginas.
- Se abre desde el admin con "Ver carta" o "Imprimir / PDF" (este abre `carta.html?imprimir=1`, que lanza la impresión al cargar). También se puede enlazar directo para los clientes.

### 5. Panel de admin (`admin.html`)
- Página aparte, a la que se entra con el icono de usuario del menú; marcada `noindex`. **No tiene clave**: una clave escrita en el frontend no protege nada; la protección real llegará con un backend.
- **Formulario:** nombre (máx. 60), precio en pesos enteros (acepta `4200` o `4.200`), catálogo, descripción corta opcional (máx. 140), estado (Disponible, Agotado u Oculto) y casilla "Destacado". Cambiar el estado permite retirar un producto sin borrarlo. Los errores se muestran junto al formulario y enfocan el campo a corregir.
- **Lista:** tabla con todos los productos, su estado y botones Editar y Eliminar (eliminar pide confirmación).
- **Carta:** botones "Ver carta" e "Imprimir / PDF".
- **Guardado:** cada cambio se guarda en el navegador (`localStorage`). Lo guardado en ese navegador tiene prioridad sobre el CSV publicado, así que el admin ve sus cambios en la tienda al instante.
- **Descargar CSV:** genera `productos.csv` (separador `;` y tildes correctas para Excel en español). Para que todos los visitantes vean los productos, se reemplaza `datos/productos.csv` con ese archivo.
- **Cargar CSV:** reemplaza la lista actual, previa confirmación. Columnas obligatorias: `nombre`, `precio`, `catalogo` (el `id` del catálogo); opcionales: `id`, `descripcion`, `destacado` (`si`/`no`) y `estado` (`disponible`, `agotado` u `oculto`; vacío cuenta como disponible). Acepta `;` o `,`, máximo 1 MB. Las filas sin `id` reciben uno nuevo; las inválidas se omiten y se informa cuántas.
- Al exportar, las celdas que empiezan con `=`, `+`, `-` o `@` se anteponen con `'` para que Excel no las ejecute como fórmula; al importar se quita de nuevo.

### 6. Datos
- `datos/tienda.json`: nombre, dirección y horario (se muestran en el pie) e `imagenHero`, la foto de portada (`null` usa el degradado).
- `datos/catalogos.json`: lista de catálogos (`id`, `nombre`, `descripcion`); trae de ejemplo los de un bar: Cervezas, Licores, Cócteles y Pasabocas. El orden del archivo es el orden en el menú y en las filas. Los `id` van en minúsculas, números y guiones; el nombre tiene máximo 40 caracteres.
- `datos/productos.csv`: productos publicados; trae 16 de ejemplo de bar (4 por catálogo, 7 destacados y la piña colada agotada). Se usa cuando el navegador no tiene productos guardados.
- Todo se valida al cargarlo: lo inválido o repetido se descarta y se registra en `console.error`; el usuario solo ve un aviso genérico. Si lo guardado en el navegador está dañado, se usa el CSV publicado.
- Los archivos se cargan con `fetch`, así que el sitio debe abrirse desde un servidor local (no con doble clic sobre el archivo).

### 7. Errores
- `404.html` con el mismo estilo y enlace al inicio.
- Todo texto que viene de los datos se inserta con `textContent` o creando nodos, nunca con `innerHTML`.

## Arquitectura

HTML, CSS y JavaScript sin framework ni paso de compilación (igual que el CRM). JS en módulos ES separados por responsabilidad: reglas puras (productos, CSV, cálculos del scroll) que se prueban sin navegador, acceso a datos (`fetch` y `localStorage`) y vistas que crean los nodos.

Tipografía: la del sistema operativo (`system-ui`, Segoe UI, Roboto, Arial), sin dependencias externas.

## Estructura de carpetas

```
landing-tiendas/
├── index.html              # Portada, filas de catálogos y destacados
├── catalogo.html           # Plantilla de catálogo
├── carta.html              # Carta digital imprimible
├── admin.html              # Panel de admin de productos
├── 404.html
├── README.md
├── package.json            # Scripts: npm start (servidor) y npm test (pruebas)
├── serve.json              # Desactiva las URLs "limpias" de serve (perderían ?categoria=)
├── assets/img/portada.jpg  # Foto de portada (ejemplo de Unsplash)
├── datos/
│   ├── tienda.json         # Configuración de la tienda
│   ├── catalogos.json      # Catálogos del menú
│   └── productos.csv       # Productos publicados
├── styles/
│   ├── variables.css       # Tokens del sistema DOPE (colores, tipografía, espacios)
│   ├── base.css            # Reset, botones, menú, filas con flecha y tarjetas de producto
│   ├── inicio.css          # Portada, su transición y destacados
│   ├── catalogo.css        # Cabecera del catálogo
│   ├── carta.css           # Carta en pantalla e impresión
│   └── admin.css           # Formulario y tabla del admin
├── src/
│   ├── datos.js            # Carga y validación de tienda y catálogos
│   ├── productos.js        # Reglas de productos: validación, estado, búsqueda (puro)
│   ├── csv.js              # Lectura y escritura de CSV (puro)
│   ├── almacen-productos.js# Productos en localStorage o desde productos.csv
│   ├── formato.js          # Formato de precios y texto para búsqueda
│   ├── dom.js              # Creación segura de nodos y avisos
│   ├── desplazamiento.js   # Agrupa el scroll por cuadro y detecta "reducir movimiento"
│   ├── hero.js             # Transición de la portada
│   ├── vista-filas.js      # Filas con flecha y relleno de letras
│   ├── tarjeta-producto.js # Tarjeta pública de producto
│   ├── vista-admin.js      # Formulario, filas de la tabla y descarga del admin
│   ├── comun.js            # Arranque compartido: datos, menú y pie
│   ├── inicio.js           # Arranque de index.html
│   ├── catalogo.js         # Arranque de catalogo.html y su buscador
│   ├── carta.js            # Arranque de carta.html
│   └── admin.js            # Arranque y acciones de admin.html
└── pruebas/                # Pruebas de la lógica pura (node --test)
```

## Uso local

Abrir la carpeta con un servidor estático (requiere Node):

```bash
npm start
```

Queda en `http://localhost:3000`; el admin, en `http://localhost:3000/admin.html`. Se usa `serve` con `serve.json`, que mantiene `catalogo.html?categoria=...` sin redirigir. Con otro servidor, verificar que no reescriba las URLs `.html`.

## Personalizar para una tienda
1. Editar `datos/tienda.json` (nombre, dirección, horario).
2. Editar `datos/catalogos.json` con los catálogos de la tienda.
3. Cargar los productos en `admin.html`, descargar el CSV y reemplazar `datos/productos.csv`.
4. Reemplazar `assets/img/portada.jpg` por la foto de la tienda (horizontal, unos 1920 px de ancho), o apuntar `imagenHero` a otra imagen de `assets/img/`.

## Pruebas
La validación de datos y productos, el CSV y los cálculos de la transición y del relleno de letras se prueban con el ejecutor nativo de Node, sin dependencias:

```bash
npm test
```
