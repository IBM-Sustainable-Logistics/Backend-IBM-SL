import { Hono } from 'https://deno.land/x/hono@v4.0.7/mod.ts'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello IBM SL')
})

app.get('/api', (c) => {
  return c.text('Here the api will live')
})

Deno.serve(app.fetch)
