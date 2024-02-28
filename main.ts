

import { Hono } from 'https://deno.land/x/hono@v4.0.7/mod.ts'
import { Index } from "./pages/index.tsx";
import { serveStatic } from "https://deno.land/x/hono@v4.0.7/middleware.ts";

export const app = new Hono()


// serve static files here 
app.use('/logo.svg', serveStatic({ path: './assets/ibm-logo.svg' }))


// static get pages using jsx here 
Index()


// api routes get/put 
app.get('/api', (c) => c.text('Here the api will live'))



Deno.serve(app.fetch)