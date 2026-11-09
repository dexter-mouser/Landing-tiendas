import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAXIMO_DESTACADOS,
  crearIdProducto,
  filtrarPorTexto,
  guardarEnLista,
  leerEstado,
  productosPublicos,
  leerPrecio,
  normalizarProductos,
  productosDelCatalogo,
  productosDestacados,
  quitarDeLista,
  validarProducto
} from '../src/productos.js';

const catalogos = new Set(['fila-1', 'fila-2']);
const base = { id: 'p-1', nombre: '  Arroz   1 kg ', precio: '4.200', catalogo: 'fila-1', descripcion: '', destacado: 'si' };

test('un producto válido se limpia y normaliza', () => {
  assert.deepEqual(validarProducto(base, catalogos).producto, {
    id: 'p-1',
    nombre: 'Arroz 1 kg',
    precio: 4200,
    catalogo: 'fila-1',
    descripcion: '',
    estado: 'disponible',
    destacado: true
  });
});

test('el estado acepta mayúsculas y tildes, vacío es disponible y lo desconocido es error', () => {
  assert.equal(leerEstado('Agotado'), 'agotado');
  assert.equal(leerEstado(' OCULTO '), 'oculto');
  assert.equal(leerEstado(''), 'disponible');
  assert.equal(leerEstado(undefined), 'disponible');
  assert.equal(leerEstado('vendido'), null);
  assert.equal(leerEstado('constructor'), null);
  assert.equal(validarProducto({ ...base, estado: 'vendido' }, catalogos).campo, 'estado');
});

test('lo oculto no es público y los destacados solo incluyen disponibles', () => {
  const lista = [
    { id: 'a', estado: 'disponible', destacado: true },
    { id: 'b', estado: 'agotado', destacado: true },
    { id: 'c', estado: 'oculto', destacado: true }
  ];
  assert.deepEqual(productosPublicos(lista).map((producto) => producto.id), ['a', 'b']);
  assert.deepEqual(productosDestacados(lista).map((producto) => producto.id), ['a']);
});

test('la búsqueda ignora tildes y mayúsculas y busca también en la descripción', () => {
  const lista = [
    { nombre: 'Piña colada', descripcion: 'Ron y coco' },
    { nombre: 'Mojito', descripcion: 'Ron blanco y hierbabuena' },
    { nombre: 'Gin tonic', descripcion: 'Ginebra' }
  ];
  assert.equal(filtrarPorTexto(lista, 'PINA').length, 1);
  assert.equal(filtrarPorTexto(lista, 'ron').length, 2);
  assert.equal(filtrarPorTexto(lista, '   ').length, 3);
  assert.equal(filtrarPorTexto(lista, 'cerveza').length, 0);
});

test('el precio acepta enteros con puntos o signo y rechaza decimales, cero y negativos', () => {
  assert.equal(leerPrecio('$ 12.500'), 12500);
  assert.equal(leerPrecio(3000), 3000);
  for (const malo of ['0', '-100', '12,5', 'abc', '', 12.5, null]) {
    const precio = leerPrecio(malo);
    assert.ok(!Number.isFinite(precio) || precio <= 0, `debería rechazar ${malo}`);
  }
});

test('cada campo inválido da un mensaje para el formulario', () => {
  assert.match(validarProducto({ ...base, nombre: '   ' }, catalogos).error, /nombre/);
  assert.match(validarProducto({ ...base, nombre: 'x'.repeat(61) }, catalogos).error, /máximo 60/);
  assert.match(validarProducto({ ...base, precio: '0' }, catalogos).error, /precio/);
  assert.match(validarProducto({ ...base, precio: '999999999' }, catalogos).error, /alto/);
  assert.match(validarProducto({ ...base, catalogo: 'otro' }, catalogos).error, /catálogo/);
  assert.match(validarProducto({ ...base, descripcion: 'x'.repeat(141) }, catalogos).error, /descripción/);
  assert.match(validarProducto({ ...base, id: 'ID MALO' }, catalogos).error, /Identificador/);
  assert.ok(validarProducto(null, catalogos).error);
  assert.equal(validarProducto({ ...base, precio: 'x' }, catalogos).campo, 'precio');
  assert.equal(validarProducto({ ...base, catalogo: '' }, catalogos).campo, 'catalogo');
});

test('normalizar descarta inválidos y repetidos y cuenta los descartados', () => {
  const resultado = normalizarProductos([base, base, { ...base, id: 'p-2', precio: 'x' }, 'basura'], catalogos);
  assert.equal(resultado.productos.length, 1);
  assert.equal(resultado.descartados, 3);
  assert.deepEqual(normalizarProductos('basura', catalogos), { productos: [], descartados: 0 });
});

test('guardar agrega o reemplaza por id y quitar elimina', () => {
  const producto = validarProducto(base, catalogos).producto;
  let lista = guardarEnLista([], producto);
  lista = guardarEnLista(lista, { ...producto, nombre: 'Arroz 2 kg' });
  assert.equal(lista.length, 1);
  assert.equal(lista[0].nombre, 'Arroz 2 kg');
  assert.deepEqual(quitarDeLista(lista, 'p-1'), []);
  assert.deepEqual(quitarDeLista(lista, 'no-existe'), lista);
});

test('filtros por catálogo y destacados con límite', () => {
  const lista = Array.from({ length: 12 }, (_, posicion) => ({
    id: `p-${posicion}`,
    catalogo: posicion % 2 ? 'fila-2' : 'fila-1',
    destacado: true,
    estado: 'disponible'
  }));
  assert.equal(productosDelCatalogo(lista, 'fila-2').length, 6);
  assert.equal(productosDestacados(lista).length, MAXIMO_DESTACADOS);
  assert.deepEqual(productosDestacados([{ destacado: false }]), []);
});

test('los ids generados son válidos y distintos', () => {
  const id = crearIdProducto();
  assert.match(id, /^[a-z0-9-]{1,60}$/);
  assert.notEqual(id, crearIdProducto());
});
