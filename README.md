# Genérico — Landing de tiendas

Página pública de la tienda que acompaña al CRM "Genérico". Por ahora es la parte visual: portada, menús y navegación hacia los catálogos, con tarjetas en blanco donde irán los productos. Es una plantilla: el mismo código sirve para cada cliente cambiando solo la configuración, los datos y las imágenes.

Diseño basado en los colores del sistema **DOPE** (`../DOPE Desing`) y en la navegación de dope.security: fondo casi negro (`#090909`), texto blanco hueso (`#f7f9fa`), tipografía genérica del sistema operativo (sin descargas) y bordes finos en lugar de sombras.

## Funcionamiento

### 1. Portada
- Ocupa toda la pantalla **a color** con el nombre de la tienda como único titular. Mientras no haya foto de la tienda, el fondo es un degradado de color hecho en CSS; si `imagenHero` apunta a una imagen, se muestra encima.
- **Transición al bajar:** la portada queda fija mientras se hace scroll y se va cubriendo de negro hasta fundirse con el fondo de la página; el titular se desvanece y sube. Las filas de catálogos entran por encima mientras se oscurece.
- El progreso (0 arriba, 1 al final) se aplica con la variable CSS `--progreso`; el cálculo se agrupa con `requestAnimationFrame` para no repetirlo en cada evento.
- Con "reducir movimiento" activado, la portada se queda a color y sin efecto.

### 2. Navegación de catálogos
- Debajo de la portada, cada catálogo es una fila ancha en mayúsculas gruesas, con una **flecha →** a la derecha que lleva a su página.
- Las letras empiezan en contorno y se rellenan una a una a medida que la fila sube por la pantalla. Al llegar al final de la página todas quedan rellenas.
- El menú superior tiene el nombre de la tienda y los mismos catálogos; marca el catálogo actual.

### 3. Catálogos (subpáginas)
- Una sola plantilla `catalogo.html` que se llena según la URL: `catalogo.html?categoria=bebidas`.
- Muestra el nombre del catálogo, su descripción y **8 tarjetas de muestra** con un recuadro blanco en lugar de imagen y líneas grises en lugar de nombre y precio.
- Al final, las filas con flecha de los demás catálogos para seguir navegando.
- Si el catálogo no existe se ve un aviso con enlace al inicio.

### 4. Datos
- `datos/tienda.json`: nombre, dirección y horario (se muestran en el pie) e `imagenHero` opcional (`null` usa el degradado).
- `datos/catalogos.json`: lista de catálogos (`id`, `nombre`, `descripcion`); trae de ejemplo "Fila 1" a "Fila 4". El orden del archivo es el orden en el menú y en las filas. Los `id` van en minúsculas, números y guiones; el nombre tiene máximo 40 caracteres.
- Los datos se validan al cargarlos: lo inválido o repetido se descarta y se registra en `console.error`; el usuario solo ve un aviso genérico si no se pudo cargar nada. La imagen de portada solo se acepta si está en `assets/img/`.
- Los JSON se cargan con `fetch`, así que el sitio debe abrirse desde un servidor local (no con doble clic sobre el archivo).

### 5. Errores
- `404.html` con el mismo estilo y enlace al inicio.
- Todo texto que viene de los datos se inserta con `textContent` o creando nodos, nunca con `innerHTML`.

## Arquitectura

HTML, CSS y JavaScript sin framework ni paso de compilación (igual que el CRM). JS en módulos ES separados por responsabilidad: carga y validación de datos, cálculos puros del scroll (probables sin navegador) y vistas que crean los nodos.

Tipografía: la del sistema operativo (`system-ui`, Segoe UI, Roboto, Arial), sin dependencias externas.

## Estructura de carpetas

```
landing-tiendas/
├── index.html              # Portada + navegación de catálogos
├── catalogo.html           # Plantilla de catálogo
├── 404.html
├── README.md
├── package.json            # Scripts: npm start (servidor) y npm test (pruebas)
├── serve.json              # Desactiva las URLs "limpias" de serve (perderían ?categoria=)
├── assets/img/             # Foto de portada cuando la haya (opcional)
├── datos/
│   ├── tienda.json         # Configuración de la tienda
│   └── catalogos.json      # Catálogos del menú
├── styles/
│   ├── variables.css       # Tokens del sistema DOPE (colores, tipografía, espacios)
│   ├── base.css            # Reset, tipografía, botones, menú y filas con flecha
│   ├── inicio.css          # Portada y su transición
│   └── catalogo.css        # Cabecera del catálogo y tarjetas de muestra
├── src/
│   ├── datos.js            # Carga y validación de JSON
│   ├── dom.js              # Creación segura de nodos y avisos
│   ├── desplazamiento.js   # Agrupa el scroll por cuadro y detecta "reducir movimiento"
│   ├── hero.js             # Transición de la portada
│   ├── vista-filas.js      # Filas con flecha y relleno de letras
│   ├── comun.js            # Arranque compartido: datos, menú y pie
│   ├── inicio.js           # Arranque de index.html
│   └── catalogo.js         # Arranque de catalogo.html
└── pruebas/                # Pruebas de la lógica pura (node --test)
```

## Uso local

Abrir la carpeta con un servidor estático (requiere Node):

```bash
npm start
```

Queda en `http://localhost:3000`. Se usa `serve` con `serve.json`, que mantiene `catalogo.html?categoria=...` sin redirigir. Con otro servidor, verificar que no reescriba las URLs `.html`.

## Personalizar para una tienda
1. Editar `datos/tienda.json` (nombre, dirección, horario).
2. Editar `datos/catalogos.json` con los catálogos de la tienda.
3. Opcional: poner la foto de la tienda en `assets/img/` y apuntar `imagenHero` a ella (por ejemplo `"assets/img/portada.jpg"`).

## Pruebas
La validación de datos y los cálculos de la transición y del relleno de letras se prueban con el ejecutor nativo de Node, sin dependencias:

```bash
npm test
```
