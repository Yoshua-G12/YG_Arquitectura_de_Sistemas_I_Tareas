export interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
}

export type DatosProducto = Omit<Producto, 'id'>
export type DatosProductoParciales = Partial<DatosProducto>

export type EstadoStock = 'agotado' | 'bajo' | 'disponible'

export function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

export function validarProducto(datos: unknown): datos is DatosProducto {
  if (!esObjeto(datos)) return false
  return (
    typeof datos.nombre === 'string' &&
    datos.nombre.trim().length > 0 &&
    typeof datos.precio === 'number' &&
    Number.isFinite(datos.precio) &&
    datos.precio >= 0 &&
    typeof datos.stock === 'number' &&
    Number.isInteger(datos.stock) &&
    datos.stock >= 0
  )
}

export function validarProductoParcial(
  datos: unknown
): datos is DatosProductoParciales {
  if (!esObjeto(datos)) return false
  const campos = Object.keys(datos)
  if (
    campos.length === 0 ||
    campos.some((campo) => !['nombre', 'precio', 'stock'].includes(campo))
  ) return false
  if (datos.nombre !== undefined &&
    (typeof datos.nombre !== 'string' || datos.nombre.trim().length === 0)) return false
  if (datos.precio !== undefined &&
    (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio < 0)) return false
  if (datos.stock !== undefined &&
    (typeof datos.stock !== 'number' || !Number.isInteger(datos.stock) || datos.stock < 0)) return false
  return true
}

export function obtenerEstadoStock(stock: number): EstadoStock {
  if (stock <= 0) return 'agotado'
  if (stock <= 5) return 'bajo'
  return 'disponible'
}
