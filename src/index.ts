import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import pino from 'pino'

// Define la estructura de un producto
interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
}

type DatosProducto = Omit<Producto, 'id'>

const app = new Hono()
const puerto = 3000

// Datos almacenados temporalmente en memoria
const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Teclado mecánico',
    precio: 350,
    stock: 10
  },
  {
    id: 2,
    nombre: 'Mouse inalámbrico',
    precio: 175,
    stock: 15
  }
]

let siguienteId = 3

// Configuración de Pino
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
})

// Registra cada petición HTTP
app.use('*', async (c, next) => {
  const inicio = Date.now()

  await next()

  logger.info(
    {
      metodo: c.req.method,
      ruta: c.req.path,
      estado: c.res.status,
      duracion: `${Date.now() - inicio} ms`
    },
    'Petición procesada'
  )
})

// Comprueba si un valor es un objeto
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

// Valida los datos completos de POST y PUT
function datosCompletosValidos(datos: unknown): datos is DatosProducto {
  if (!esObjeto(datos)) {
    return false
  }

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

// Valida los datos parciales de PATCH
function datosParcialesValidos(
  datos: unknown
): datos is Partial<DatosProducto> {
  if (!esObjeto(datos)) {
    return false
  }

  const campos = Object.keys(datos)
  const camposPermitidos = ['nombre', 'precio', 'stock']

  if (
    campos.length === 0 ||
    campos.some((campo) => !camposPermitidos.includes(campo))
  ) {
    return false
  }

  if (
    datos.nombre !== undefined &&
    (typeof datos.nombre !== 'string' || datos.nombre.trim().length === 0)
  ) {
    return false
  }

  if (
    datos.precio !== undefined &&
    (typeof datos.precio !== 'number' ||
      !Number.isFinite(datos.precio) ||
      datos.precio < 0)
  ) {
    return false
  }

  if (
    datos.stock !== undefined &&
    (typeof datos.stock !== 'number' ||
      !Number.isInteger(datos.stock) ||
      datos.stock < 0)
  ) {
    return false
  }

  return true
}

// Convierte y valida el ID recibido en la URL
function convertirId(valor: string): number | null {
  const id = Number(valor)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

// Ruta principal
app.get('/', (c) => {
  return c.json({
    mensaje: 'API de productos funcionando',
    endpoints: '/productos'
  })
})

// GET: obtener todos los productos
app.get('/productos', (c) => {
  return c.json({
    total: productos.length,
    productos
  })
})

// GET: obtener un producto por ID
app.get('/productos/:id', (c) => {
  const id = convertirId(c.req.param('id'))

  if (id === null) {
    return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
  }

  const producto = productos.find((elemento) => elemento.id === id)

  if (!producto) {
    return c.json({ error: 'Producto no encontrado' }, 404)
  }

  return c.json({ producto })
})

// POST: crear un producto
app.post('/productos', async (c) => {
  const datos: unknown = await c.req.json().catch(() => null)

  if (!datosCompletosValidos(datos)) {
    return c.json(
      {
        error: 'Datos inválidos',
        camposRequeridos: {
          nombre: 'Texto no vacío',
          precio: 'Número mayor o igual a cero',
          stock: 'Número entero mayor o igual a cero'
        }
      },
      400
    )
  }

  const nuevoProducto: Producto = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    precio: datos.precio,
    stock: datos.stock
  }

  productos.push(nuevoProducto)

  return c.json(
    {
      mensaje: 'Producto creado correctamente',
      producto: nuevoProducto
    },
    201
  )
})

// PUT: reemplazar completamente un producto
app.put('/productos/:id', async (c) => {
  const id = convertirId(c.req.param('id'))

  if (id === null) {
    return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
  }

  const posicion = productos.findIndex((producto) => producto.id === id)

  if (posicion === -1) {
    return c.json({ error: 'Producto no encontrado' }, 404)
  }

  const datos: unknown = await c.req.json().catch(() => null)

  if (!datosCompletosValidos(datos)) {
    return c.json(
      {
        error: 'PUT requiere nombre, precio y stock válidos'
      },
      400
    )
  }

  productos[posicion] = {
    id,
    nombre: datos.nombre.trim(),
    precio: datos.precio,
    stock: datos.stock
  }

  return c.json({
    mensaje: 'Producto reemplazado correctamente',
    producto: productos[posicion]
  })
})

// PATCH: modificar únicamente algunos campos
app.patch('/productos/:id', async (c) => {
  const id = convertirId(c.req.param('id'))

  if (id === null) {
    return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
  }

  const producto = productos.find((elemento) => elemento.id === id)

  if (!producto) {
    return c.json({ error: 'Producto no encontrado' }, 404)
  }

  const datos: unknown = await c.req.json().catch(() => null)

  if (!datosParcialesValidos(datos)) {
    return c.json(
      {
        error: 'Debes enviar al menos un campo válido: nombre, precio o stock'
      },
      400
    )
  }

  if (datos.nombre !== undefined) {
    producto.nombre = datos.nombre.trim()
  }

  if (datos.precio !== undefined) {
    producto.precio = datos.precio
  }

  if (datos.stock !== undefined) {
    producto.stock = datos.stock
  }

  return c.json({
    mensaje: 'Producto modificado correctamente',
    producto
  })
})

// DELETE: eliminar un producto
app.delete('/productos/:id', (c) => {
  const id = convertirId(c.req.param('id'))

  if (id === null) {
    return c.json({ error: 'El ID debe ser un entero positivo' }, 400)
  }

  const posicion = productos.findIndex((producto) => producto.id === id)

  if (posicion === -1) {
    return c.json({ error: 'Producto no encontrado' }, 404)
  }

  productos.splice(posicion, 1)

  return c.body(null, 204)
})

// Respuesta para cualquier ruta inexistente
app.notFound((c) => {
  return c.json({ error: 'Ruta no encontrada' }, 404)
})

serve({
  fetch: app.fetch,
  port: puerto
})

logger.info(`Servidor ejecutándose en http://localhost:${puerto}`)