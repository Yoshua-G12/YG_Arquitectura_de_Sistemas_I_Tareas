import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

describe('API de productos', () => {
  it('consulta productos con estado de stock', async () => {
    const response = await createApp().request('/productos')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.productos[0].estadoStock).toBe('disponible')
  })

  it('ejecuta crear, actualizar y eliminar', async () => {
    const app = createApp()
    const creado = await app.request('/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: 'Monitor', precio: 2000, stock: 3 }) })
    expect(creado.status).toBe(201)
    const producto = (await creado.json()).producto
    const actualizado = await app.request(`/productos/${producto.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: 0 }) })
    expect((await actualizado.json()).producto.estadoStock).toBe('agotado')
    expect((await app.request(`/productos/${producto.id}`, { method: 'DELETE' })).status).toBe(204)
  })

  it('rechaza datos inválidos, JSON malformado y recursos inexistentes', async () => {
    const app = createApp()
    expect((await app.request('/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status).toBe(400)
    expect((await app.request('/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: '', precio: -1, stock: 1.5 }) })).status).toBe(400)
    expect((await app.request('/productos/999')).status).toBe(404)
  })
})
