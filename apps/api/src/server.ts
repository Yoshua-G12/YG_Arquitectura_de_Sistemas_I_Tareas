import { serve } from '@hono/node-server'
import { createApp } from './app.js'

const puerto = Number(process.env.PORT ?? 3000)
serve({ fetch: createApp().fetch, port: puerto })
console.log(`API ejecutándose en http://localhost:${puerto}`)
