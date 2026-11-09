import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertirACsv, dividirCsv, leerCsv } from '../src/csv.js';

const productos = [
  { id: 'p-1', nombre: 'Café "premium"; 500 g', precio: 9800, catalogo: 'fila-1', descripcion: 'Línea 1\nLínea 2', destacado: true },
  { id: 'p-2', nombre: '=HYPERLINK("x")', precio: 1800, catalogo: 'fila-2', descripcion: '-oferta', destacado: false }
];

test('exportar y volver a leer conserva los datos', () => {
  const filas = leerCsv(convertirACsv(productos));
  assert.equal(filas.length, 2);
  assert.equal(filas[0].nombre, 'Café "premium"; 500 g');
  assert.equal(filas[0].descripcion, 'Línea 1\nLínea 2');
  assert.equal(filas[0].destacado, 'si');
  assert.equal(filas[1].nombre, '=HYPERLINK("x")');
  assert.equal(filas[1].descripcion, '-oferta');
});

test('el estado se exporta en su columna', () => {
  const filas = leerCsv(convertirACsv([{ ...productos[0], estado: 'agotado' }]));
  assert.equal(filas[0].estado, 'agotado');
});

test('al exportar, las celdas que parecen fórmula quedan neutralizadas', () => {
  const texto = convertirACsv(productos);
  assert.ok(texto.startsWith('﻿'));
  assert.match(texto, /"'=HYPERLINK\(""x""\)"/);
  assert.match(texto, /;'-oferta;/);
});

test('acepta separador coma, encabezados en mayúsculas y columnas en otro orden', () => {
  const filas = leerCsv('Precio,Nombre,Catalogo\r\n4200,Arroz,fila-1\n\n');
  assert.deepEqual(filas, [{ precio: '4200', nombre: 'Arroz', catalogo: 'fila-1' }]);
});

test('sin columnas obligatorias devuelve null y un archivo vacío no da filas', () => {
  assert.equal(leerCsv('a;b\n1;2'), null);
  assert.deepEqual(leerCsv(''), []);
  assert.deepEqual(dividirCsv('\n\n'), []);
});
