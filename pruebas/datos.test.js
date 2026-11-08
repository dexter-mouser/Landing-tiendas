import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esImagenValida, validarCatalogo, validarCatalogos, validarTienda } from '../src/datos.js';

test('catálogo válido conserva sus datos y la descripción es opcional', () => {
  assert.deepEqual(validarCatalogo({ id: 'bebidas', nombre: ' Bebidas ' }), {
    id: 'bebidas',
    nombre: 'Bebidas',
    descripcion: ''
  });
});

test('catálogo con id inválido, nombre vacío o muy largo se descarta', () => {
  assert.equal(validarCatalogo({ id: 'Con Espacios', nombre: 'X' }), null);
  assert.equal(validarCatalogo({ id: 'x', nombre: '   ' }), null);
  assert.equal(validarCatalogo({ id: 'x', nombre: 'x'.repeat(41) }), null);
  assert.equal(validarCatalogo(null), null);
});

test('la lista descarta repetidos e inválidos y tolera datos corruptos', (contexto) => {
  contexto.mock.method(console, 'error', () => {});
  const validos = validarCatalogos([
    { id: 'aseo', nombre: 'Aseo' },
    { id: 'aseo', nombre: 'Aseo otra vez' },
    { id: 'malo' }
  ]);
  assert.deepEqual(validos.map((catalogo) => catalogo.id), ['aseo']);
  assert.deepEqual(validarCatalogos('basura'), []);
  assert.deepEqual(validarCatalogos([]), []);
});

test('solo se aceptan imágenes locales de assets/img', () => {
  assert.equal(esImagenValida('assets/img/hero.svg'), true);
  assert.equal(esImagenValida('https://otro.com/a.png'), false);
  assert.equal(esImagenValida('javascript:alert(1)'), false);
  assert.equal(esImagenValida('assets/img/../../secreto.png'), false);
});

test('la tienda exige nombre y descarta imágenes externas', () => {
  assert.equal(validarTienda({ direccion: 'Calle 1' }), null);
  const tienda = validarTienda({ nombre: 'T', imagenHero: 'https://otro.com/a.png' });
  assert.equal(tienda.imagenHero, null);
  assert.equal(tienda.direccion, '');
  assert.equal(validarTienda({ nombre: 'T', imagenHero: null }).imagenHero, null);
});
