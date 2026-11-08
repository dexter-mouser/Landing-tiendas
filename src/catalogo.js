import { iniciarPagina } from './comun.js';
import { crearElemento, mostrarAviso } from './dom.js';
import { crearFila, iniciarRevelado } from './vista-filas.js';

// Solo visual: tarjetas en blanco hasta conectar los productos reales.
const TARJETAS_DE_MUESTRA = 8;

const contenido = document.getElementById('catalogo-lista');
const datos = await iniciarPagina(contenido);
if (datos) mostrarCatalogo(datos);

function mostrarCatalogo({ tienda, catalogos }) {
  const idCategoria = new URLSearchParams(location.search).get('categoria');
  const catalogo = catalogos.find((candidato) => candidato.id === idCategoria);
  if (!catalogo) {
    mostrarAviso(contenido, 'No encontramos ese catálogo.');
  } else {
    document.title = `${catalogo.nombre} — ${tienda.nombre}`;
    document.getElementById('catalogo-titulo').textContent = catalogo.nombre;
    document.getElementById('catalogo-descripcion').textContent = catalogo.descripcion;
    contenido.replaceChildren(...Array.from({ length: TARJETAS_DE_MUESTRA }, crearTarjetaMuestra));
  }
  dibujarOtrosCatalogos(catalogos.filter((otro) => otro.id !== catalogo?.id));
}

function crearTarjetaMuestra() {
  const tarjeta = crearElemento('div', 'muestra');
  tarjeta.setAttribute('aria-hidden', 'true');
  const cuerpo = crearElemento('div', 'muestra__cuerpo');
  cuerpo.append(crearElemento('div', 'muestra__linea'), crearElemento('div', 'muestra__linea muestra__linea--corta'));
  tarjeta.append(crearElemento('div', 'muestra__imagen'), cuerpo);
  return tarjeta;
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
