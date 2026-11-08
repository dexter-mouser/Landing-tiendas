import { alDesplazar, limitarProgreso, prefiereMenosMovimiento } from './desplazamiento.js';
import { crearElemento } from './dom.js';

// La fila empieza a llenarse al entrar por abajo y termina a media pantalla.
const INICIO_REVELADO = 0.95;
const TRAMO_REVELADO = 0.45;
const MARGEN_FINAL_PX = 4;
const NS_SVG = 'http://www.w3.org/2000/svg';

export function calcularProgresoFila(topFila, altoPantalla) {
  return limitarProgreso((altoPantalla * INICIO_REVELADO - topFila) / (altoPantalla * TRAMO_REVELADO));
}

export function contarLetrasReveladas(progreso, totalLetras) {
  return Math.round(limitarProgreso(progreso) * totalLetras);
}

export function enlaceCatalogo(id) {
  return `catalogo.html?categoria=${encodeURIComponent(id)}`;
}

function crearFlecha() {
  const svg = document.createElementNS(NS_SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('fila__flecha');
  const trazo = document.createElementNS(NS_SVG, 'path');
  trazo.setAttribute('d', 'M3 12h17M13 5l7 7-7 7');
  svg.append(trazo);
  return svg;
}

// Cada letra va en su propio span para poder rellenarla por separado.
export function crearFila(catalogo) {
  const item = crearElemento('li');
  const enlace = crearElemento('a', 'fila');
  enlace.href = enlaceCatalogo(catalogo.id);
  enlace.setAttribute('aria-label', catalogo.nombre);

  const texto = crearElemento('span', 'fila__texto');
  texto.setAttribute('aria-hidden', 'true');
  for (const caracter of catalogo.nombre) {
    texto.append(crearElemento('span', 'letra--contorno', caracter));
  }

  enlace.append(texto, crearFlecha());
  item.append(enlace);
  return item;
}

export function iniciarRevelado(lista) {
  const filas = [...lista.querySelectorAll('.fila')].map((fila) => ({
    fila,
    letras: [...fila.querySelectorAll('.fila__texto > span')],
    reveladas: 0
  }));

  alDesplazar(() => {
    // Al final de la página las últimas filas no alcanzan la mitad de la pantalla: se rellenan del todo.
    const estaAlFinal = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - MARGEN_FINAL_PX;
    const rellenarTodo = prefiereMenosMovimiento() || estaAlFinal;
    for (const datos of filas) {
      const progreso = rellenarTodo ? 1 : calcularProgresoFila(datos.fila.getBoundingClientRect().top, window.innerHeight);
      const reveladas = contarLetrasReveladas(progreso, datos.letras.length);
      // Solo toca el DOM si cambió el número de letras reveladas.
      if (reveladas === datos.reveladas) continue;
      datos.letras.forEach((letra, posicion) => letra.classList.toggle('letra--contorno', posicion >= reveladas));
      datos.reveladas = reveladas;
    }
  });
}
