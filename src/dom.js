// Crea nodos con texto seguro: nunca se usa innerHTML con datos.
export function crearElemento(etiqueta, clase = '', texto = '') {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

export function mostrarAviso(contenedor, mensaje, conEnlaceInicio = true) {
  const aviso = crearElemento('p', 'aviso', mensaje);
  if (conEnlaceInicio) {
    const enlace = crearElemento('a', '', 'Volver al inicio');
    enlace.href = 'index.html';
    aviso.append(' ', enlace);
  }
  contenedor.replaceChildren(aviso);
}
