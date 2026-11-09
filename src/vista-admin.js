// Piezas de interfaz del panel de admin: formulario y filas de la tabla.
import { crearElemento } from './dom.js';
import { formatearPrecio } from './formato.js';
import { ESTADOS } from './productos.js';

export function llenarSelectorCatalogos(selector, catalogos) {
  selector.replaceChildren(
    ...catalogos.map((catalogo) => {
      const opcion = crearElemento('option', '', catalogo.nombre);
      opcion.value = catalogo.id;
      return opcion;
    })
  );
}

// Devuelve los valores crudos; la validación vive en productos.js.
export function leerFormulario(formulario) {
  const campos = formulario.elements;
  return {
    nombre: campos.nombre.value,
    precio: campos.precio.value,
    catalogo: campos.catalogo.value,
    descripcion: campos.descripcion.value,
    estado: campos.estado.value,
    destacado: campos.destacado.checked
  };
}

export function llenarFormulario(formulario, producto) {
  const campos = formulario.elements;
  campos.nombre.value = producto.nombre;
  campos.precio.value = String(producto.precio);
  campos.catalogo.value = producto.catalogo;
  campos.descripcion.value = producto.descripcion;
  campos.estado.value = producto.estado;
  campos.destacado.checked = producto.destacado;
}

function crearBoton(texto, etiqueta, alHacerClic) {
  const boton = crearElemento('button', 'boton', texto);
  boton.type = 'button';
  boton.setAttribute('aria-label', etiqueta);
  boton.addEventListener('click', alHacerClic);
  return boton;
}

function crearCelda(texto, clase = '') {
  return crearElemento('td', clase, texto);
}

export function crearFilaProducto(producto, nombreCatalogo, { alEditar, alEliminar }) {
  const fila = crearElemento('tr');
  const acciones = crearElemento('div', 'tabla__acciones');
  acciones.append(
    crearBoton('Editar', `Editar ${producto.nombre}`, () => alEditar(producto)),
    crearBoton('Eliminar', `Eliminar ${producto.nombre}`, () => alEliminar(producto))
  );
  const celdaAcciones = crearElemento('td');
  celdaAcciones.append(acciones);

  fila.append(
    crearCelda(producto.nombre),
    crearCelda(nombreCatalogo),
    crearCelda(formatearPrecio(producto.precio), 'tabla__numero'),
    crearCelda(ESTADOS[producto.estado], `tabla__estado tabla__estado--${producto.estado}`),
    crearCelda(producto.destacado ? 'Sí' : '—'),
    celdaAcciones
  );
  return fila;
}

export function descargarTexto(texto, nombreArchivo, tipo) {
  const enlace = crearElemento('a');
  enlace.href = URL.createObjectURL(new Blob([texto], { type: tipo }));
  enlace.download = nombreArchivo;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(enlace.href);
}
