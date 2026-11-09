import { cargarProductos } from './almacen-productos.js';
import { iniciarPagina } from './comun.js';
import { crearElemento, mostrarAviso } from './dom.js';
import { iniciarTransicionHero } from './hero.js';
import { productosDestacados } from './productos.js';
import { crearTarjetaProducto } from './tarjeta-producto.js';
import { crearFila, iniciarRevelado } from './vista-filas.js';

iniciarTransicionHero(document.getElementById('hero'));

const contenedor = document.getElementById('catalogos-contenido');
const datos = await iniciarPagina(contenedor);
if (datos) {
  llenarHero(datos.tienda);
  dibujarCatalogos(datos.catalogos);
  dibujarDestacados(datos.catalogos, await cargarProductos(datos.catalogos));
}

// Sin imagen configurada, la portada usa el degradado de color del CSS.
function llenarHero(tienda) {
  document.title = `${tienda.nombre} — Tienda`;
  if (!tienda.imagenHero) return;
  const imagen = document.getElementById('hero-imagen');
  imagen.src = tienda.imagenHero;
  imagen.hidden = false;
}

function dibujarCatalogos(catalogos) {
  if (!catalogos.length) {
    mostrarAviso(contenedor, 'Pronto publicaremos nuestros catálogos.', false);
    return;
  }
  const lista = crearElemento('ul', 'filas');
  lista.append(...catalogos.map(crearFila));
  contenedor.replaceChildren(lista);
  iniciarRevelado(lista);
}

// La sección solo aparece si hay productos marcados como destacados.
function dibujarDestacados(catalogos, productos) {
  const destacados = productosDestacados(productos);
  if (!destacados.length) return;
  const nombrePorCatalogo = new Map(catalogos.map((catalogo) => [catalogo.id, catalogo.nombre]));
  document.getElementById('destacados-lista').replaceChildren(
    ...destacados.map((producto) => crearTarjetaProducto(producto, nombrePorCatalogo.get(producto.catalogo)))
  );
  document.getElementById('destacados').hidden = false;
}
