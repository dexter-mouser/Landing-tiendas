import { cargarDatosTienda } from './datos.js';
import { crearElemento, mostrarAviso } from './dom.js';
import { enlaceCatalogo } from './vista-filas.js';

const MENSAJE_ERROR_CARGA = 'No pudimos cargar la tienda en este momento. Intenta de nuevo en unos minutos.';

// Arranque compartido por todas las páginas: datos, menú y pie.
// Devuelve null si no se pudieron cargar los datos (ya se avisó al usuario).
export async function iniciarPagina(contenedorAviso) {
  try {
    const datos = await cargarDatosTienda();
    llenarMenu(datos.tienda, datos.catalogos);
    llenarPie(datos.tienda);
    return datos;
  } catch (error) {
    console.error('Error al iniciar la página.', error);
    mostrarAviso(contenedorAviso, MENSAJE_ERROR_CARGA, false);
    return null;
  }
}

function llenarMenu(tienda, catalogos) {
  document.querySelectorAll('[data-nombre-tienda]').forEach((elemento) => {
    elemento.textContent = tienda.nombre;
  });
  const categoriaActual = new URLSearchParams(location.search).get('categoria');
  const enlaces = catalogos.map((catalogo) => {
    const item = crearElemento('li');
    const enlace = crearElemento('a', '', catalogo.nombre);
    enlace.href = enlaceCatalogo(catalogo.id);
    if (catalogo.id === categoriaActual) enlace.setAttribute('aria-current', 'page');
    item.append(enlace);
    return item;
  });
  document.getElementById('enlaces-categorias').replaceChildren(...enlaces);
}

function llenarPie(tienda) {
  const partes = [`© ${new Date().getFullYear()} ${tienda.nombre}`, tienda.direccion, tienda.horario].filter(Boolean);
  document.getElementById('pie-datos').replaceChildren(...partes.map((texto) => crearElemento('p', '', texto)));
}
