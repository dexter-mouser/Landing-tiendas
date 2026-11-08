import { iniciarPagina } from './comun.js';
import { crearElemento, mostrarAviso } from './dom.js';
import { iniciarTransicionHero } from './hero.js';
import { crearFila, iniciarRevelado } from './vista-filas.js';

iniciarTransicionHero(document.getElementById('hero'));

const contenedor = document.getElementById('catalogos-contenido');
const datos = await iniciarPagina(contenedor);
if (datos) {
  llenarHero(datos.tienda);
  dibujarCatalogos(datos.catalogos);
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
