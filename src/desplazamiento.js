export function limitarProgreso(valor) {
  return Math.min(1, Math.max(0, valor));
}

export function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Llama a actualizar() como máximo una vez por cuadro mientras se hace scroll o cambia el tamaño.
export function alDesplazar(actualizar) {
  let estaProgramado = false;
  const programar = () => {
    if (estaProgramado) return;
    estaProgramado = true;
    requestAnimationFrame(() => {
      estaProgramado = false;
      actualizar();
    });
  };
  window.addEventListener('scroll', programar, { passive: true });
  window.addEventListener('resize', programar);
  actualizar();
}
