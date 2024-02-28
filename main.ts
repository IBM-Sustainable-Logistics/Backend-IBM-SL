

import { Hono } from 'https://deno.land/x/hono@v4.0.7/mod.ts'
import { Index } from "./pages/index.tsx";
import { serveStatic } from "https://deno.land/x/hono@v4.0.7/middleware.ts";
import { z, OpenAPIHono } from "npm:@hono/zod-openapi@0.9.5";

export const app = new OpenAPIHono();

// serve static files here 
//app.use('/logo.svg', serveStatic({ path: './assets/ibm-logo.svg' }))


// static get pages using jsx here 
Index()

const api = new Hono().basePath('/api')

// api routes get/put 
api.get('/', async (c) => {
    const body = await c.req.json()

    c.text('Here the api will live')
})



Deno.serve(app.fetch)
