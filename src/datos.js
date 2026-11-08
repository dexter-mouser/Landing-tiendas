// Carga y validación de los JSON de la tienda. Las funciones de validación son puras
// para poder probarlas sin navegador.

const RUTA_TIENDA = 'datos/tienda.json';
const RUTA_CATALOGOS = 'datos/catalogos.json';

const LARGO_MAXIMO_NOMBRE = 40;
const LARGO_MAXIMO_TEXTO = 300;
const PATRON_ID = /^[a-z0-9-]{1,60}$/;
// Solo imágenes locales: evita que un dato manipulado cargue URLs externas o "javascript:".
const PATRON_IMAGEN = /^assets\/img\/[a-z0-9_\-/]+\.(svg|png|jpe?g|webp|avif)$/i;

export function esTextoValido(valor, largoMaximo) {
  return typeof valor === 'string' && valor.trim().length > 0 && valor.length <= largoMaximo;
}

export function esImagenValida(valor) {
  return typeof valor === 'string' && PATRON_IMAGEN.test(valor) && !valor.includes('..');
}

function textoOpcional(valor) {
  return esTextoValido(valor, LARGO_MAXIMO_TEXTO) ? valor.trim() : '';
}

export function validarCatalogo(catalogo) {
  if (!catalogo || typeof catalogo !== 'object') return null;
  const { id, nombre, descripcion } = catalogo;
  if (typeof id !== 'string' || !PATRON_ID.test(id)) return null;
  if (!esTextoValido(nombre, LARGO_MAXIMO_NOMBRE)) return null;
  return { id, nombre: nombre.trim(), descripcion: textoOpcional(descripcion) };
}

// Descarta lo inválido o repetido y lo registra en consola; nunca lanza por un dato malo.
export function validarCatalogos(datos) {
  if (!Array.isArray(datos)) return [];
  const idsVistos = new Set();
  const validos = [];
  datos.forEach((elemento, posicion) => {
    const valido = validarCatalogo(elemento);
    if (!valido || idsVistos.has(valido.id)) {
      console.error(`Se descartó un catálogo inválido o repetido en la posición ${posicion}.`, elemento);
      return;
    }
    idsVistos.add(valido.id);
    validos.push(valido);
  });
  return validos;
}

export function validarTienda(datos) {
  if (!datos || typeof datos !== 'object') return null;
  if (!esTextoValido(datos.nombre, LARGO_MAXIMO_NOMBRE)) return null;
  return {
    nombre: datos.nombre.trim(),
    direccion: textoOpcional(datos.direccion),
    horario: textoOpcional(datos.horario),
    imagenHero: esImagenValida(datos.imagenHero) ? datos.imagenHero : null
  };
}

async function leerJson(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta} (HTTP ${respuesta.status}).`);
  return respuesta.json();
}

export async function cargarDatosTienda() {
  const [tiendaCruda, catalogosCrudos] = await Promise.all([leerJson(RUTA_TIENDA), leerJson(RUTA_CATALOGOS)]);
  const tienda = validarTienda(tiendaCruda);
  if (!tienda) throw new Error('datos/tienda.json no tiene un nombre válido.');
  return { tienda, catalogos: validarCatalogos(catalogosCrudos) };
}
