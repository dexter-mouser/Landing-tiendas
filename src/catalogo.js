import { cargarProductos } from './almacen-productos.js';
import { iniciarPagina } from './comun.js';
import { mostrarAviso } from './dom.js';
import { filtrarPorTexto, productosDelCatalogo, productosPublicos } from './productos.js';
import { crearTarjetaProducto } from './tarjeta-producto.js';
import { crearFila, iniciarRevelado } from './vista-filas.js';

const contenido = document.getElementById('catalogo-lista');
const datos = await iniciarPagina(contenido);
if (datos) mostrarCatalogo(datos.tienda, datos.catalogos, await cargarProductos(datos.catalogos));

function mostrarCatalogo(tienda, catalogos, productos) {
  const idCategoria = new URLSearchParams(location.search).get('categoria');
  const catalogo = catalogos.find((candidato) => candidato.id === idCategoria);
  if (!catalogo) {
    mostrarAviso(contenido, 'No encontramos ese catálogo.');
  } else {
    document.title = `${catalogo.nombre} — ${tienda.nombre}`;
    document.getElementById('catalogo-titulo').textContent = catalogo.nombre;
    document.getElementById('catalogo-descripcion').textContent = catalogo.descripcion;
    dibujarProductos(productosPublicos(productosDelCatalogo(productos, catalogo.id)));
  }
  dibujarOtrosCatalogos(catalogos.filter((otro) => otro.id !== catalogo?.id));
}

function dibujarProductos(productos) {
  if (!productos.length) {
    mostrarAviso(contenido, 'Este catálogo todavía no tiene productos.');
    return;
  }
  // Las tarjetas se crean una vez; buscar solo las muestra u oculta.
  const tarjetaPorId = new Map(productos.map((producto) => [producto.id, crearTarjetaProducto(producto)]));
  contenido.replaceChildren(...tarjetaPorId.values());
  conectarBuscador(productos, tarjetaPorId);
}

function conectarBuscador(productos, tarjetaPorId) {
  const campo = document.getElementById('campo-busqueda');
  const resultado = document.getElementById('buscador-resultado');
  const sinResultados = document.getElementById('sin-resultados');

  const filtrar = () => {
    const idsVisibles = new Set(filtrarPorTexto(productos, campo.value).map((producto) => producto.id));
    tarjetaPorId.forEach((tarjeta, id) => {
      tarjeta.hidden = !idsVisibles.has(id);
    });
    resultado.textContent = idsVisibles.size === 1 ? '1 producto' : `${idsVisibles.size} productos`;
    sinResultados.hidden = idsVisibles.size > 0;
  };

  campo.addEventListener('input', filtrar);
  document.getElementById('buscador').hidden = false;
  filtrar();
}

function dibujarOtrosCatalogos(otros) {
  const lista = document.getElementById('otros-catalogos');
  if (!otros.length) {
    document.getElementById('otros').hidden = true;
    return;
  }
  lista.replaceChildren(...otros.map(crearFila));
  iniciarRevelado(lista);
}
