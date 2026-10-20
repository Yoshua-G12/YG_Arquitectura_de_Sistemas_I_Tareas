import { Hono } from 'hono'
import pino from 'pino'
import {
  type Producto,
  obtenerEstadoStock,
  validarProducto,
  validarProductoParcial
} from '@repo/shared'

const logger = pino()

export function createApp(initialProducts: Producto[] = [
  { id: 1, nombre: 'Teclado mecánico', precio: 350, stock: 10 },
  { id: 2, nombre: 'Mouse inalámbrico', precio: 175, stock: 15 }
]) {
  const productos = initialProducts.map((producto) => ({ ...producto }))
  let siguienteId = Math.max(0, ...productos.map(({ id }) => id)) + 1
  const app = new Hono()

  app.use('*', async (c, next) => {
    const inicio = Date.now()
    await next()
    logger.info({ metodo: c.req.method, ruta: c.req.path, estado: c.res.status, duracion: `${Date.now() - inicio} ms` }, 'Petición procesada')
  })

  const respuestaProducto = (producto: Producto) => ({
    ...producto,
    estadoStock: obtenerEstadoStock(producto.stock)
  })
  const convertirId = (valor: string) => {
    const id = Number(valor)
    return Number.isInteger(id) && id > 0 ? id : null
  }
  const datosInvalidos = (mensaje = 'Datos inválidos') => ({
    error: mensaje,
    camposRequeridos: { nombre: 'Texto no vacío', precio: 'Número mayor o igual a cero', stock: 'Número entero mayor o igual a cero' }
  })
  app.get('/', (c) => c.json({ mensaje: 'API de productos funcionando', endpoints: '/productos' }))
  app.get('/productos', (c) => c.json({ total: productos.length, productos: productos.map(respuestaProducto) }))
  app.get('/productos/:id', (c) => {
    const id = convertirId(c.req.param('id'))
    if (id === null) return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
    const producto = productos.find((elemento) => elemento.id === id)
    if (!producto) return c.json({ error: 'Producto no encontrado' }, 404)
    return c.json({ producto: respuestaProducto(producto) })
  })
  app.post('/productos', async (c) => {
    const datos: unknown = await c.req.json().catch(() => null)
    if (!validarProducto(datos)) return c.json(datosInvalidos(), 400)
    const producto: Producto = { id: siguienteId++, nombre: datos.nombre.trim(), precio: datos.precio, stock: datos.stock }
    productos.push(producto)
    return c.json({ mensaje: 'Producto creado correctamente', producto: respuestaProducto(producto) }, 201)
  })
  app.put('/productos/:id', async (c) => {
    const id = convertirId(c.req.param('id'))
    if (id === null) return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
    const posicion = productos.findIndex((producto) => producto.id === id)
    if (posicion === -1) return c.json({ error: 'Producto no encontrado' }, 404)
    const datos: unknown = await c.req.json().catch(() => null)
    if (!validarProducto(datos)) return c.json(datosInvalidos('PUT requiere nombre, precio y stock válidos'), 400)
    productos[posicion] = { id, nombre: datos.nombre.trim(), precio: datos.precio, stock: datos.stock }
    return c.json({ mensaje: 'Producto reemplazado correctamente', producto: respuestaProducto(productos[posicion]) })
  })
  app.patch('/productos/:id', async (c) => {
    const id = convertirId(c.req.param('id'))
    if (id === null) return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
    const producto = productos.find((elemento) => elemento.id === id)
    if (!producto) return c.json({ error: 'Producto no encontrado' }, 404)
    const datos: unknown = await c.req.json().catch(() => null)
    if (!validarProductoParcial(datos)) return c.json({ error: 'Debes enviar al menos un campo válido: nombre, precio o stock' }, 400)
    if (datos.nombre !== undefined) producto.nombre = datos.nombre.trim()
    if (datos.precio !== undefined) producto.precio = datos.precio
    if (datos.stock !== undefined) producto.stock = datos.stock
    return c.json({ mensaje: 'Producto modificado correctamente', producto: respuestaProducto(producto) })
  })
  app.delete('/productos/:id', (c) => {
    const id = convertirId(c.req.param('id'))
    if (id === null) return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
    const posicion = productos.findIndex((producto) => producto.id === id)
    if (posicion === -1) return c.json({ error: 'Producto no encontrado' }, 404)
    productos.splice(posicion, 1)
    return c.body(null, 204)
  })
  app.notFound((c) => c.json({ error: 'Ruta no encontrada' }, 404))
  return app
}

export type ProductoConEstado = Producto & { estadoStock: ReturnType<typeof obtenerEstadoStock> }
