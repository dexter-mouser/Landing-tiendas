import { alDesplazar, limitarProgreso, prefiereMenosMovimiento } from './desplazamiento.js';

// Cuánto se ha recorrido del hero: 0 arriba (a color), 1 al final (cubierto de negro).
export function calcularProgreso(desplazamiento, altoHero, altoPantalla) {
  const recorrido = altoHero - altoPantalla;
  if (recorrido <= 0) return 0;
  return limitarProgreso(desplazamiento / recorrido);
}

export function iniciarTransicionHero(hero) {
  alDesplazar(() => {
    if (prefiereMenosMovimiento()) {
      hero.style.removeProperty('--progreso');
      return;
    }
    const desplazamiento = -hero.getBoundingClientRect().top;
    const progreso = calcularProgreso(desplazamiento, hero.offsetHeight, window.innerHeight);
    hero.style.setProperty('--progreso', progreso.toFixed(3));
  });
}
