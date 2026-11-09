// Lectura y escritura de CSV de productos. Usa ";" porque Excel en español
// lo abre en columnas; al leer también acepta ",".

export const COLUMNAS = ['id', 'nombre', 'precio', 'catalogo', 'descripcion', 'destacado', 'estado'];
const SEPARADOR = ';';
const BOM = '﻿';

// Evita que Excel interprete una celda como fórmula (inyección CSV).
function neutralizarFormula(texto) {
  return /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
}

function escaparCelda(valor) {
  const texto = neutralizarFormula(String(valor ?? ''));
  return /[";,\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function convertirACsv(productos) {
  const filas = productos.map((producto) =>
    COLUMNAS.map((columna) => {
      if (columna === 'destacado') return producto.destacado ? 'si' : 'no';
      return escaparCelda(producto[columna]);
    }).join(SEPARADOR)
  );
  // El BOM hace que Excel muestre bien las tildes.
  return BOM + [COLUMNAS.join(SEPARADOR), ...filas].join('\r\n') + '\r\n';
}

function detectarSeparador(primeraLinea) {
  return primeraLinea.includes(';') ? ';' : ',';
}

// Divide el texto en filas de celdas respetando comillas y saltos de línea dentro de ellas.
export function dividirCsv(texto) {
  const limpio = texto.replace(/^﻿/, '');
  const separador = detectarSeparador(limpio.split(/\r?\n/, 1)[0]);
  const filas = [];
  let fila = [];
  let celda = '';
  let estaEntreComillas = false;

  for (let posicion = 0; posicion < limpio.length; posicion += 1) {
    const caracter = limpio[posicion];
    if (estaEntreComillas) {
      if (caracter === '"' && limpio[posicion + 1] === '"') {
        celda += '"';
        posicion += 1;
      } else if (caracter === '"') {
        estaEntreComillas = false;
      } else {
        celda += caracter;
      }
    } else if (caracter === '"') {
      estaEntreComillas = true;
    } else if (caracter === separador) {
      fila.push(celda);
      celda = '';
    } else if (caracter === '\n' || caracter === '\r') {
      if (caracter === '\r' && limpio[posicion + 1] === '\n') posicion += 1;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = '';
    } else {
      celda += caracter;
    }
  }
  if (celda || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas.filter((celdas) => celdas.some((valor) => valor.trim()));
}

// Quita la comilla que se agregó al exportar para neutralizar fórmulas.
function restaurarCelda(texto) {
  return /^'[=+\-@]/.test(texto) ? texto.slice(1) : texto;
}

// Convierte el CSV en objetos usando la fila de encabezados; sin encabezados válidos devuelve null.
export function leerCsv(texto) {
  const [encabezados, ...filas] = dividirCsv(texto);
  if (!encabezados) return [];
  const nombres = encabezados.map((nombre) => nombre.trim().toLowerCase());
  if (!['nombre', 'precio', 'catalogo'].every((obligatoria) => nombres.includes(obligatoria))) return null;
  return filas.map((celdas) =>
    Object.fromEntries(nombres.map((nombre, posicion) => [nombre, restaurarCelda(celdas[posicion] ?? '')]))
  );
}
