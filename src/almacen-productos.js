import { leerCsv } from './csv.js';
import { normalizarProductos } from './productos.js';

const CLAVE_PRODUCTOS = 'landing-tiendas:productos';
const RUTA_CSV_PUBLICADO = 'datos/productos.csv';

// null significa "no hay lista guardada en este navegador" (distinto de una lista vacía).
export function leerProductosGuardados() {
  try {
    const texto = localStorage.getItem(CLAVE_PRODUCTOS);
    if (texto === null) return null;
    const datos = JSON.parse(texto);
    return Array.isArray(datos) ? datos : null;
  } catch (error) {
    console.error('No se pudieron leer los productos guardados.', error);
    return null;
  }
}

// Devuelve false si el navegador no permitió guardar (sin espacio o bloqueado).
export function guardarProductos(lista) {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(lista));
    return true;
  } catch (error) {
    console.error('No se pudieron guardar los productos.', error);
    return false;
  }
}

async function leerCsvPublicado() {
  try {
    const respuesta = await fetch(RUTA_CSV_PUBLICADO, { cache: 'no-cache' });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return leerCsv(await respuesta.text()) ?? [];
  } catch (error) {
    console.error(`No se pudo leer ${RUTA_CSV_PUBLICADO}.`, error);
    return [];
  }
}

// Lo guardado en este navegador manda; si no hay nada, se usa el CSV publicado.
export async function cargarProductos(catalogos) {
  const idsCatalogos = new Set(catalogos.map((catalogo) => catalogo.id));
  const crudos = leerProductosGuardados() ?? (await leerCsvPublicado());
  const { productos, descartados } = normalizarProductos(crudos, idsCatalogos);
  if (descartados) console.error(`Se descartaron ${descartados} productos inválidos o repetidos.`);
  return productos;
}
