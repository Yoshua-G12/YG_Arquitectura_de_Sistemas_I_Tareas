import { serve } from '@hono/node-server'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import pino from 'pino'

interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
}

const puerto = 3000

const productos: Producto[] = [
  { id: 1, nombre: 'Teclado mecánico', precio: 350, stock: 10 },
  { id: 2, nombre: 'Mouse inalámbrico', precio: 175, stock: 15 }
]

let siguienteId = 3

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
})

const app = new OpenAPIHono({
  defaultHook: (resultado, c) => {
    if (!resultado.success) {
      return c.json({ error: 'Datos inválidos' }, 400)
    }
  }
})

// Registro de peticiones con Pino
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

// Esquema del producto
const ProductoSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    nombre: z.string().min(1).openapi({
      example: 'Teclado mecánico'
    }),
    precio: z.number().min(0).openapi({
      example: 350
    }),
    stock: z.number().int().min(0).openapi({
      example: 10
    })
  })
  .openapi('Producto')

// Esquema utilizado por POST y PUT
const DatosProductoSchema = z
  .object({
    nombre: z.string().trim().min(1).openapi({
      example: 'Monitor gamer'
    }),
    precio: z.number().min(0).openapi({
      example: 2500
    }),
    stock: z.number().int().min(0).openapi({
      example: 5
    })
  })
  .openapi('DatosProducto')

// Esquema utilizado por PATCH
const DatosParcialesProductoSchema =
  DatosProductoSchema.partial().openapi('DatosParcialesProducto')

// Validación del ID recibido en la URL
const IdProductoSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 1
  })
})

// Esquema para respuestas de error
const ErrorSchema = z
  .object({
    error: z.string().openapi({
      example: 'Producto no encontrado'
    })
  })
  .openapi('Error')

const RespuestaProductoSchema = z.object({
  producto: ProductoSchema
})

const RespuestaConMensajeSchema = z.object({
  mensaje: z.string(),
  producto: ProductoSchema
})

// GET /productos
const listarProductosRoute = createRoute({
  method: 'get',
  path: '/productos',
  tags: ['Productos'],
  summary: 'Obtener todos los productos',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            total: z.number().int(),
            productos: z.array(ProductoSchema)
          })
        }
      },
      description: 'Lista de productos'
    }
  }
})

app.openapi(listarProductosRoute, (c) => {
  return c.json(
    {
      total: productos.length,
      productos
    },
    200
  )
})

// GET /productos/:id
const obtenerProductoRoute = createRoute({
  method: 'get',
  path: '/productos/{id}',
  tags: ['Productos'],
  summary: 'Obtener un producto por ID',
  request: {
    params: IdProductoSchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RespuestaProductoSchema
        }
      },
      description: 'Producto encontrado'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'ID inválido'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Producto no encontrado'
    }
  }
})

app.openapi(obtenerProductoRoute, (c) => {
  const { id } = c.req.valid('param')

  const producto = productos.find(
    (elemento) => elemento.id === id
  )

  if (!producto) {
    return c.json(
      {
        error: 'Producto no encontrado'
      },
      404
    )
  }

  return c.json({ producto }, 200)
})

// POST /productos
const crearProductoRoute = createRoute({
  method: 'post',
  path: '/productos',
  tags: ['Productos'],
  summary: 'Crear un producto',
  request: {
    body: {
      content: {
        'application/json': {
          schema: DatosProductoSchema
        }
      },
      required: true
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: RespuestaConMensajeSchema
        }
      },
      description: 'Producto creado'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Datos inválidos'
    }
  }
})

app.openapi(crearProductoRoute, (c) => {
  const datos = c.req.valid('json')

  const nuevoProducto: Producto = {
    id: siguienteId++,
    nombre: datos.nombre,
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

// PUT /productos/:id
const reemplazarProductoRoute = createRoute({
  method: 'put',
  path: '/productos/{id}',
  tags: ['Productos'],
  summary: 'Reemplazar completamente un producto',
  request: {
    params: IdProductoSchema,
    body: {
      content: {
        'application/json': {
          schema: DatosProductoSchema
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RespuestaConMensajeSchema
        }
      },
      description: 'Producto reemplazado'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Datos o ID inválidos'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Producto no encontrado'
    }
  }
})

app.openapi(reemplazarProductoRoute, (c) => {
  const { id } = c.req.valid('param')
  const datos = c.req.valid('json')

  const posicion = productos.findIndex(
    (producto) => producto.id === id
  )

  if (posicion === -1) {
    return c.json(
      {
        error: 'Producto no encontrado'
      },
      404
    )
  }

  const productoActualizado: Producto = {
    id,
    ...datos
  }

  productos[posicion] = productoActualizado

  return c.json(
    {
      mensaje: 'Producto reemplazado correctamente',
      producto: productoActualizado
    },
    200
  )
})

// PATCH /productos/:id
const modificarProductoRoute = createRoute({
  method: 'patch',
  path: '/productos/{id}',
  tags: ['Productos'],
  summary: 'Modificar algunos campos de un producto',
  request: {
    params: IdProductoSchema,
    body: {
      content: {
        'application/json': {
          schema: DatosParcialesProductoSchema
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RespuestaConMensajeSchema
        }
      },
      description: 'Producto modificado'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Datos o ID inválidos'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Producto no encontrado'
    }
  }
})

app.openapi(modificarProductoRoute, (c) => {
  const { id } = c.req.valid('param')
  const datos = c.req.valid('json')

  const producto = productos.find(
    (elemento) => elemento.id === id
  )

  if (!producto) {
    return c.json(
      {
        error: 'Producto no encontrado'
      },
      404
    )
  }

  if (Object.keys(datos).length === 0) {
    return c.json(
      {
        error: 'Debes enviar al menos un campo'
      },
      400
    )
  }

  Object.assign(producto, datos)

  return c.json(
    {
      mensaje: 'Producto modificado correctamente',
      producto
    },
    200
  )
})

// DELETE /productos/:id
const eliminarProductoRoute = createRoute({
  method: 'delete',
  path: '/productos/{id}',
  tags: ['Productos'],
  summary: 'Eliminar un producto',
  request: {
    params: IdProductoSchema
  },
  responses: {
    204: {
      description: 'Producto eliminado'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'ID inválido'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Producto no encontrado'
    }
  }
})

app.openapi(eliminarProductoRoute, (c) => {
  const { id } = c.req.valid('param')

  const posicion = productos.findIndex(
    (producto) => producto.id === id
  )

  if (posicion === -1) {
    return c.json(
      {
        error: 'Producto no encontrado'
      },
      404
    )
  }

  productos.splice(posicion, 1)

  return c.body(null, 204)
})

// Ruta principal
app.get('/', (c) => {
  return c.json({
    mensaje: 'API de productos funcionando',
    documentacion: '/docs'
  })
})

// Documento OpenAPI generado automáticamente
app.doc31('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'API de Productos',
    version: '2.0.0',
    description:
      'API CRUD creada con Hono, TypeScript, Pino y Scalar.'
  },
  servers: [
    {
      url: `http://localhost:${puerto}`
    }
  ]
})

// Interfaz de documentación Scalar
app.get(
  '/docs',
  Scalar({
    url: '/openapi.json',
    theme: 'purple',
    pageTitle: 'API de Productos'
  })
)

app.notFound((c) => {
  return c.json(
    {
      error: 'Ruta no encontrada'
    },
    404
  )
})

serve({
  fetch: app.fetch,
  port: puerto
})

logger.info(
  `Servidor ejecutándose en http://localhost:${puerto}`
)

logger.info(
  `Documentación disponible en http://localhost:${puerto}/docs`
)