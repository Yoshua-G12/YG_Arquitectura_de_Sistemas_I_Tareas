import { validarProducto, type DatosProducto } from '@repo/shared'

export function datosDesdeFormulario(form: HTMLFormElement): DatosProducto | null {
  const datos = new FormData(form)
  const candidato = {
    nombre: String(datos.get('nombre') ?? ''),
    precio: Number(datos.get('precio')),
    stock: Number(datos.get('stock'))
  }
  return validarProducto(candidato) ? { ...candidato, nombre: candidato.nombre.trim() } : null
}

export function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'No fue posible completar la operación.'
}
