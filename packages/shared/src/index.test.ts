import { describe, expect, it } from 'vitest'
import { obtenerEstadoStock, validarProducto, validarProductoParcial } from './index.js'

describe('validaciones de productos', () => {
  it('acepta datos válidos y rechaza datos inválidos', () => {
    expect(validarProducto({ nombre: 'Teclado', precio: 100, stock: 5 })).toBe(true)
    expect(validarProducto({ nombre: ' ', precio: 100, stock: 5 })).toBe(false)
    expect(validarProducto({ nombre: 'Teclado', precio: -1, stock: 5 })).toBe(false)
    expect(validarProducto({ nombre: 'Teclado', precio: 100, stock: 1.5 })).toBe(false)
  })

  it('valida actualizaciones parciales', () => {
    expect(validarProductoParcial({ stock: 0 })).toBe(true)
    expect(validarProductoParcial({})).toBe(false)
    expect(validarProductoParcial({ color: 'rojo' })).toBe(false)
  })
})

describe('estado de stock', () => {
  it.each([
    [0, 'agotado'],
    [-1, 'agotado'],
    [1, 'bajo'],
    [5, 'bajo'],
    [6, 'disponible']
  ])('clasifica %i como %s', (stock, estado) => {
    expect(obtenerEstadoStock(stock)).toBe(estado)
  })
})
