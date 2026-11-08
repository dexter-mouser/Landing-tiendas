import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularProgresoFila, contarLetrasReveladas, enlaceCatalogo } from '../src/vista-filas.js';

test('la fila empieza en contorno abajo y queda rellena a media pantalla', () => {
  assert.equal(calcularProgresoFila(800, 800), 0);
  assert.equal(calcularProgresoFila(760, 800), 0);
  assert.equal(calcularProgresoFila(400, 800), 1);
  assert.equal(calcularProgresoFila(-200, 800), 1);
});

test('las letras reveladas se limitan entre cero y el total', () => {
  assert.equal(contarLetrasReveladas(0, 8), 0);
  assert.equal(contarLetrasReveladas(0.5, 8), 4);
  assert.equal(contarLetrasReveladas(1, 8), 8);
  assert.equal(contarLetrasReveladas(2, 8), 8);
  assert.equal(contarLetrasReveladas(-1, 8), 0);
  assert.equal(contarLetrasReveladas(0.5, 0), 0);
});

test('el enlace del catálogo codifica el id', () => {
  assert.equal(enlaceCatalogo('bebidas'), 'catalogo.html?categoria=bebidas');
  assert.equal(enlaceCatalogo('a&b'), 'catalogo.html?categoria=a%26b');
});
