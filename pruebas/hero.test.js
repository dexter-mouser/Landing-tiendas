import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularProgreso } from '../src/hero.js';

test('arriba del todo el hero está a color (progreso 0) y al final cubierto (1)', () => {
  assert.equal(calcularProgreso(0, 1360, 800), 0);
  assert.equal(calcularProgreso(280, 1360, 800), 0.5);
  assert.equal(calcularProgreso(560, 1360, 800), 1);
  assert.equal(calcularProgreso(5000, 1360, 800), 1);
  assert.equal(calcularProgreso(-100, 1360, 800), 0);
});

test('si el hero no es más alto que la pantalla, se queda a color', () => {
  assert.equal(calcularProgreso(0, 700, 800), 0);
  assert.equal(calcularProgreso(300, 800, 800), 0);
});
