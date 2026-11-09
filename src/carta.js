// Carta digital: todos los productos públicos agrupados por catálogo, lista para imprimir.
import { cargarProductos } from './almacen-productos.js';
import { cargarDatosTienda } from './datos.js';
import { crearElemento, mostrarAviso } from './dom.js';
import { formatearPrecio } from './formato.js';
import { productosDelCatalogo, productosPublicos } from './productos.js';

const MENSAJE_ERROR_CARGA = 'No pudimos cargar la carta en este momento. Intenta de nuevo en unos minutos.';
const contenido = document.getElementById('carta-contenido');

document.getElementById('boton-imprimir').addEventListener('click', () => window.print());
iniciar();

async function iniciar() {
  try {
    const { tienda, catalogos } = await cargarDatosTienda();
    const productos = productosPublicos(await cargarProductos(catalogos));
    llenarTienda(tienda);
    dibujarCarta(catalogos, productos);
  } catch (error) {
    console.error('Error al cargar la carta.', error);
    mostrarAviso(contenido, MENSAJE_ERROR_CARGA);
    return;
  }
  // Desde el admin, "Imprimir / PDF" abre la carta con ?imprimir=1.
  if (new URLSearchParams(location.search).has('imprimir')) window.print();
}

function llenarTienda(tienda) {
  document.title = `Carta — ${tienda.nombre}`;
  document.querySelectorAll('[data-nombre-tienda]').forEach((elemento) => {
    elemento.textContent = tienda.nombre;
  });
  const partes = [tienda.direccion, tienda.horario].filter(Boolean);
  document.getElementById('pie-datos').replaceChildren(...partes.map((texto) => crearElemento('p', '', texto)));
}

// Solo aparecen los catálogos que tienen productos visibles.
function dibujarCarta(catalogos, productos) {
  const secciones = catalogos
    .map((catalogo) => ({ catalogo, productos: productosDelCatalogo(productos, catalogo.id) }))
    .filter((grupo) => grupo.productos.length)
    .map(({ catalogo, productos: delCatalogo }) => crearSeccion(catalogo, delCatalogo));
  if (!secciones.length) {
    mostrarAviso(contenido, 'La carta todavía no tiene productos.');
    return;
  }
  contenido.replaceChildren(...secciones);
}

function crearSeccion(catalogo, productos) {
  const seccion = crearElemento('section', 'carta__seccion');
  const lista = crearElemento('ul', 'carta__lista');
  lista.append(...productos.map(crearItem));
  seccion.append(crearElemento('h2', 'carta__titulo', catalogo.nombre), lista);
  return seccion;
}

function crearItem(producto) {
  const estaAgotado = producto.estado === 'agotado';
  const item = crearElemento('li', estaAgotado ? 'carta__item carta__item--agotado' : 'carta__item');
  const linea = crearElemento('div', 'carta__linea');
  linea.append(crearElemento('h3', 'carta__nombre', producto.nombre), crearElemento('span', 'carta__puntos'));
  if (estaAgotado) linea.append(crearElemento('span', 'carta__agotado', 'Agotado'));
  linea.append(crearElemento('span', 'carta__precio', formatearPrecio(producto.precio)));
  item.append(linea);
  if (producto.descripcion) item.append(crearElemento('p', 'carta__descripcion', producto.descripcion));
  return item;
}
