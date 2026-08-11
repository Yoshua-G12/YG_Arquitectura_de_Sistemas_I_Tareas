import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import pino from 'pino'

interface Libro {
  id: number
  titulo: string
  autor: string
  prestado: boolean
}

const app = new Hono()
const puerto = 3000
const logger = pino()

const libros: Libro[] = [
  {
    id: 1,
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    prestado: false
  },
  {
    id: 2,
    titulo: 'The Pragmatic Programmer',
    autor: 'Andrew Hunt',
    prestado: true
  },
  {
    id: 3,
    titulo: 'Design Patterns',
    autor: 'Erich Gamma',
    prestado: false
  }
]

let siguienteId = 4

app.use('*', async (c, next) => {
  const inicio = Date.now()

  await next()

  logger.info({
    metodo: c.req.method,
    ruta: c.req.path,
    estado: c.res.status,
    duracion: `${Date.now() - inicio} ms`
  })
})

app.get('/', (c) => {
  return c.json({
    mensaje: 'API de biblioteca funcionando',
    endpoints: [
      'GET /books',
      'POST /books',
      'GET /health/fitness'
    ]
  })
})

app.get('/books', (c) => {
  return c.json({
    total: libros.length,
    books: libros
  }, 200)
})

app.post('/books', async (c) => {
  const contentType = c.req.header('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return c.json({
      error: 'El cuerpo debe enviarse como application/json'
    }, 415)
  }

  const datos: unknown = await c.req.json().catch(() => null)

  if (
    typeof datos !== 'object' ||
    datos === null ||
    Array.isArray(datos)
  ) {
    return c.json({
      error: 'El cuerpo contiene un JSON inválido'
    }, 400)
  }

  const body = datos as Record<string, unknown>

  if (
    typeof body.titulo !== 'string' ||
    body.titulo.trim() === '' ||
    typeof body.autor !== 'string' ||
    body.autor.trim() === '' ||
    typeof body.prestado !== 'boolean'
  ) {
    return c.json({
      error: 'Datos del libro inválidos',
      camposRequeridos: {
        titulo: 'Texto no vacío',
        autor: 'Texto no vacío',
        prestado: 'Valor booleano: true o false'
      }
    }, 400)
  }

  const nuevoLibro: Libro = {
    id: siguienteId++,
    titulo: body.titulo.trim(),
    autor: body.autor.trim(),
    prestado: body.prestado
  }

  libros.push(nuevoLibro)

  return c.json({
    mensaje: 'Libro agregado correctamente',
    book: nuevoLibro
  }, 201)
})

app.get('/health/fitness', (c) => {
  const totalLibros = libros.length
  const librosPrestados = libros.filter(
    (libro) => libro.prestado
  ).length

  const ratio = totalLibros === 0
    ? 0
    : librosPrestados / totalLibros

  const cumpleCapacidad = totalLibros <= 100
  const cumpleRatio = ratio < 0.8
  const saludable = cumpleCapacidad && cumpleRatio

  const reporte = {
    status: saludable
      ? 'Healthy'
      : 'Degradacion de Calidad',

    metrics: {
      totalBooks: totalLibros,
      borrowedBooks: librosPrestados,
      borrowedRatioPercentage: Number(
        (ratio * 100).toFixed(2)
      ),
      maxBooksAllowed: 100,
      maxBorrowedRatioAllowed: 80
    },

    restrictions: {
      capacity: {
        complies: cumpleCapacidad,
        description: 'El total de libros no debe exceder 100'
      },
      borrowedRatio: {
        complies: cumpleRatio,
        description: 'Los libros prestados deben ser menos del 80%'
      }
    }
  }

  if (saludable) {
    return c.json(reporte, 200)
  }

  return c.json(reporte, 503)
})

app.notFound((c) => {
  return c.json({
    error: 'Ruta no encontrada'
  }, 404)
})

serve({
  fetch: app.fetch,
  port: puerto
})

logger.info(`Servidor ejecutándose en http://localhost:${puerto}`)