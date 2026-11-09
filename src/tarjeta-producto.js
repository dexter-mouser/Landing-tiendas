import { crearElemento } from './dom.js';
import { formatearPrecio } from './formato.js';

// Tarjeta pública de producto. La imagen es un recuadro blanco hasta que haya fotos.
export function crearTarjetaProducto(producto, nombreCatalogo = '') {
  const estaAgotado = producto.estado === 'agotado';
  const tarjeta = crearElemento('article', estaAgotado ? 'producto producto--agotado' : 'producto');
  const cuerpo = crearElemento('div', 'producto__cuerpo');
  if (nombreCatalogo) cuerpo.append(crearElemento('p', 'etiqueta', nombreCatalogo));
  cuerpo.append(crearElemento('h3', 'producto__nombre', producto.nombre));
  if (producto.descripcion) cuerpo.append(crearElemento('p', 'producto__descripcion', producto.descripcion));

  const pie = crearElemento('p', 'producto__precio', formatearPrecio(producto.precio));
  if (estaAgotado) pie.append(crearElemento('span', 'distintivo-agotado', 'Agotado'));
  cuerpo.append(pie);

  const imagen = crearElemento('div', 'producto__imagen');
  imagen.setAttribute('aria-hidden', 'true');
  tarjeta.append(imagen, cuerpo);
  return tarjeta;
}
