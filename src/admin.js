// Panel de admin: agrega, edita y elimina productos; exporta e importa CSV.
import { cargarProductos, guardarProductos } from './almacen-productos.js';
import { convertirACsv, leerCsv } from './csv.js';
import { cargarDatosTienda } from './datos.js';
import { crearIdProducto, guardarEnLista, normalizarProductos, quitarDeLista, validarProducto } from './productos.js';
import {
  crearFilaProducto,
  descargarTexto,
  leerFormulario,
  llenarFormulario,
  llenarSelectorCatalogos
} from './vista-admin.js';

const TAMANO_MAXIMO_CSV = 1024 * 1024;
const MENSAJE_ERROR_CARGA = 'No se pudieron cargar los datos de la tienda. Intenta de nuevo más tarde.';

const formulario = document.getElementById('formulario-producto');
const estado = document.getElementById('admin-estado');
const errorFormulario = document.getElementById('error-formulario');
const botonGuardar = document.getElementById('boton-guardar');
const botonCancelar = document.getElementById('boton-cancelar');

let catalogos = [];
let nombrePorCatalogo = new Map();
let productos = [];
let idEnEdicion = null;

iniciar();

async function iniciar() {
  try {
    const datos = await cargarDatosTienda();
    catalogos = datos.catalogos;
    nombrePorCatalogo = new Map(catalogos.map((catalogo) => [catalogo.id, catalogo.nombre]));
    productos = await cargarProductos(catalogos);
  } catch (error) {
    console.error('Error al iniciar el panel de admin.', error);
    mostrarEstado(MENSAJE_ERROR_CARGA);
    formulario.hidden = true;
    return;
  }
  llenarSelectorCatalogos(document.getElementById('campo-catalogo'), catalogos);
  conectarEventos();
  dibujarLista();
}

function conectarEventos() {
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    guardarFormulario();
  });
  botonCancelar.addEventListener('click', limpiarFormulario);
  document.getElementById('boton-descargar').addEventListener('click', descargarCsv);
  document.getElementById('archivo-csv').addEventListener('change', (evento) => importarCsv(evento.target));
}

function mostrarEstado(mensaje) {
  estado.textContent = mensaje;
}

// Guarda en el navegador; si no se puede, la lista en pantalla no cambia.
function persistir(nuevaLista, mensaje) {
  if (!guardarProductos(nuevaLista)) {
    mostrarEstado('No se pudo guardar en este navegador. Revisa que el almacenamiento no esté bloqueado.');
    return false;
  }
  productos = nuevaLista;
  dibujarLista();
  mostrarEstado(mensaje);
  return true;
}

function guardarFormulario() {
  const idsCatalogos = new Set(nombrePorCatalogo.keys());
  const datos = { ...leerFormulario(formulario), id: idEnEdicion ?? crearIdProducto() };
  const { producto, campo, error } = validarProducto(datos, idsCatalogos);
  errorFormulario.textContent = error ?? '';
  marcarCampoInvalido(campo);
  if (error) return;

  const mensaje = idEnEdicion ? `Se actualizó "${producto.nombre}".` : `Se agregó "${producto.nombre}".`;
  if (persistir(guardarEnLista(productos, producto), mensaje)) limpiarFormulario();
}

const CAMPOS_EDITABLES = ['nombre', 'precio', 'catalogo', 'descripcion', 'estado'];

// Señala el campo con error para lectores de pantalla y lo enfoca.
function marcarCampoInvalido(nombreCampo) {
  const campos = formulario.elements;
  CAMPOS_EDITABLES.forEach((nombre) => campos[nombre].removeAttribute('aria-invalid'));
  if (!CAMPOS_EDITABLES.includes(nombreCampo)) return;
  campos[nombreCampo].setAttribute('aria-invalid', 'true');
  campos[nombreCampo].focus();
}

function editarProducto(producto) {
  idEnEdicion = producto.id;
  llenarFormulario(formulario, producto);
  document.getElementById('titulo-formulario').textContent = 'Editar producto';
  botonGuardar.textContent = 'Guardar cambios';
  botonCancelar.hidden = false;
  errorFormulario.textContent = '';
  formulario.elements.nombre.focus();
}

function limpiarFormulario() {
  idEnEdicion = null;
  formulario.reset();
  marcarCampoInvalido(null);
  errorFormulario.textContent = '';
  document.getElementById('titulo-formulario').textContent = 'Nuevo producto';
  botonGuardar.textContent = 'Agregar producto';
  botonCancelar.hidden = true;
}

function eliminarProducto(producto) {
  if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
  if (persistir(quitarDeLista(productos, producto.id), `Se eliminó "${producto.nombre}".`) && idEnEdicion === producto.id) {
    limpiarFormulario();
  }
}

function dibujarLista() {
  const acciones = { alEditar: editarProducto, alEliminar: eliminarProducto };
  document.getElementById('tabla-productos').replaceChildren(
    ...productos.map((producto) => crearFilaProducto(producto, nombrePorCatalogo.get(producto.catalogo) ?? '', acciones))
  );
  document.getElementById('titulo-lista').textContent = `Lista (${productos.length})`;
  document.getElementById('lista-vacia').hidden = productos.length > 0;
}

function descargarCsv() {
  descargarTexto(convertirACsv(productos), 'productos.csv', 'text/csv;charset=utf-8');
  mostrarEstado(`Se descargó productos.csv con ${productos.length} productos.`);
}

async function importarCsv(entrada) {
  const archivo = entrada.files[0];
  entrada.value = '';
  if (!archivo) return;
  if (archivo.size > TAMANO_MAXIMO_CSV) {
    mostrarEstado('El archivo es demasiado grande (máximo 1 MB).');
    return;
  }
  try {
    reemplazarConCsv(await archivo.text());
  } catch (error) {
    console.error('No se pudo leer el CSV.', error);
    mostrarEstado('No se pudo leer el archivo.');
  }
}

function reemplazarConCsv(texto) {
  const filas = leerCsv(texto);
  if (!filas) {
    mostrarEstado('El archivo no tiene las columnas nombre, precio y catalogo.');
    return;
  }
  // Las filas creadas a mano en Excel pueden venir sin id.
  const conId = filas.map((fila) => ({ ...fila, id: fila.id?.trim() || crearIdProducto() }));
  const { productos: nuevos, descartados } = normalizarProductos(conId, new Set(nombrePorCatalogo.keys()));
  const pregunta = `Se cargarán ${nuevos.length} productos y se reemplazará la lista actual (${productos.length}). ¿Continuar?`;
  if (!window.confirm(pregunta)) return;
  const filasOmitidas = descartados === 1 ? '1 fila' : `${descartados} filas`;
  const aviso = descartados ? ` Se omitió ${filasOmitidas} con datos inválidos.` : '';
  if (persistir(nuevos, `Se cargaron ${nuevos.length} productos.${aviso}`)) limpiarFormulario();
}
