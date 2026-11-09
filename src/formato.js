const formateadoresPorClave = new Map();

// Reutiliza el formateador: crearlo en cada tarjeta es costoso.
export function formatearPrecio(valor, moneda = 'COP', idioma = 'es-CO') {
  const clave = `${idioma}|${moneda}`;
  if (!formateadoresPorClave.has(clave)) {
    formateadoresPorClave.set(
      clave,
      new Intl.NumberFormat(idioma, { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
    );
  }
  return formateadoresPorClave.get(clave).format(valor);
}

// Para comparar textos sin tildes ni mayúsculas: "cafe" encuentra "Café".
export function normalizarTexto(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
