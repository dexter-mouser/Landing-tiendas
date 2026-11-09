// Reglas de los productos, sin DOM ni almacenamiento.
import { normalizarTexto } from './formato.js';

// "agotado" se ve con etiqueta; "oculto" nunca llega a la parte pública.
export const ESTADOS = { disponible: 'Disponible', agotado: 'Agotado', oculto: 'Oculto' };
export const ESTADO_INICIAL = 'disponible';
export const LARGO_MAXIMO_NOMBRE = 60;
export const LARGO_MAXIMO_DESCRIPCION = 140;
export const PRECIO_MAXIMO = 100_000_000;
export const MAXIMO_PRODUCTOS = 1000;
export const MAXIMO_DESTACADOS = 8;
const PATRON_ID = /^[a-z0-9-]{1,60}$/;

// randomUUID solo existe en contextos seguros (https o localhost); fuera de ellos se usa un respaldo.
export function crearIdProducto() {
  if (globalThis.crypto?.randomUUID) return `p-${crypto.randomUUID()}`;
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function textoLimpio(valor) {
  return typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : '';
}

// Acepta "4200", "4.200" o 4200; los precios son enteros en pesos.
export function leerPrecio(valor) {
  if (typeof valor === 'number') return Number.isInteger(valor) ? valor : NaN;
  const texto = textoLimpio(valor).replace(/[$\s.]/g, '');
  return /^\d+$/.test(texto) ? Number(texto) : NaN;
}

function leerDestacado(valor) {
  if (typeof valor === 'boolean') return valor;
  return ['si', 'sí', 'true', '1', 'x'].includes(textoLimpio(valor).toLowerCase());
}

// Vacío cuenta como disponible (CSV anteriores no traen la columna); un valor desconocido es null.
export function leerEstado(valor) {
  const texto = normalizarTexto(typeof valor === 'string' ? valor : '');
  if (!texto) return ESTADO_INICIAL;
  return Object.hasOwn(ESTADOS, texto) ? texto : null;
}

// Primer error encontrado como { campo, error }, o null si todo está bien.
function buscarError({ id, nombre, precio, catalogo, descripcion, estado }, idsCatalogos) {
  if (!PATRON_ID.test(id)) return { campo: 'id', error: 'Identificador inválido.' };
  if (!nombre) return { campo: 'nombre', error: 'Escribe el nombre del producto.' };
  if (nombre.length > LARGO_MAXIMO_NOMBRE) {
    return { campo: 'nombre', error: `El nombre admite máximo ${LARGO_MAXIMO_NOMBRE} caracteres.` };
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    return { campo: 'precio', error: 'El precio debe ser un número entero mayor que cero.' };
  }
  if (precio > PRECIO_MAXIMO) return { campo: 'precio', error: 'El precio es demasiado alto.' };
  if (!idsCatalogos.has(catalogo)) return { campo: 'catalogo', error: 'Elige un catálogo de la lista.' };
  if (descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
    return { campo: 'descripcion', error: `La descripción admite máximo ${LARGO_MAXIMO_DESCRIPCION} caracteres.` };
  }
  if (!estado) return { campo: 'estado', error: 'Elige un estado: disponible, agotado u oculto.' };
  return null;
}

// Devuelve { producto } si es válido o { campo, error } con un mensaje para el formulario.
export function validarProducto(datos, idsCatalogos) {
  if (!datos || typeof datos !== 'object') return { campo: null, error: 'Producto inválido.' };
  const limpio = {
    id: textoLimpio(datos.id),
    nombre: textoLimpio(datos.nombre),
    precio: leerPrecio(datos.precio),
    catalogo: textoLimpio(datos.catalogo),
    descripcion: textoLimpio(datos.descripcion),
    estado: leerEstado(datos.estado)
  };
  const fallo = buscarError(limpio, idsCatalogos);
  if (fallo) return fallo;
  return { producto: { ...limpio, destacado: leerDestacado(datos.destacado) } };
}

// Filtra una lista cruda (de localStorage o CSV): quita inválidos y repetidos.
export function normalizarProductos(lista, idsCatalogos) {
  if (!Array.isArray(lista)) return { productos: [], descartados: 0 };
  const idsVistos = new Set();
  const productos = [];
  for (const crudo of lista.slice(0, MAXIMO_PRODUCTOS)) {
    const { producto } = validarProducto(crudo, idsCatalogos);
    if (!producto || idsVistos.has(producto.id)) continue;
    idsVistos.add(producto.id);
    productos.push(producto);
  }
  return { productos, descartados: Math.min(lista.length, MAXIMO_PRODUCTOS) - productos.length };
}

// Agrega el producto o reemplaza el que tenga el mismo id.
export function guardarEnLista(lista, producto) {
  const existe = lista.some((actual) => actual.id === producto.id);
  return existe ? lista.map((actual) => (actual.id === producto.id ? producto : actual)) : [...lista, producto];
}

export function quitarDeLista(lista, id) {
  return lista.filter((producto) => producto.id !== id);
}

export function productosDelCatalogo(lista, idCatalogo) {
  return lista.filter((producto) => producto.catalogo === idCatalogo);
}

// Lo que puede ver un cliente: todo menos lo oculto.
export function productosPublicos(lista) {
  return lista.filter((producto) => producto.estado !== 'oculto');
}

// Solo productos disponibles: un agotado no se promociona.
export function productosDestacados(lista) {
  return lista
    .filter((producto) => producto.destacado && producto.estado === 'disponible')
    .slice(0, MAXIMO_DESTACADOS);
}

// Busca en nombre y descripción sin importar tildes ni mayúsculas.
export function filtrarPorTexto(lista, consulta) {
  const buscado = normalizarTexto(consulta);
  if (!buscado) return lista;
  return lista.filter((producto) => normalizarTexto(`${producto.nombre} ${producto.descripcion}`).includes(buscado));
}
