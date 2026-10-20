import { describe, expect, it } from 'vitest'
import { datosDesdeFormulario } from './form'

describe('formulario de productos', () => {
  it('convierte y valida datos correctos', () => {
    const form = document.createElement('form')
    form.innerHTML = '<input name="nombre" value="  Cámara  "><input name="precio" value="125.5"><input name="stock" value="4">'
    expect(datosDesdeFormulario(form)).toEqual({ nombre: 'Cámara', precio: 125.5, stock: 4 })
  })

  it('rechaza precios negativos y stock decimal', () => {
    const form = document.createElement('form')
    form.innerHTML = '<input name="nombre" value="Cámara"><input name="precio" value="-1"><input name="stock" value="2.5">'
    expect(datosDesdeFormulario(form)).toBeNull()
  })
})
