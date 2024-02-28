

import { Hono } from 'https://deno.land/x/hono@v4.0.7/mod.ts'
import { Index } from "./pages/index.tsx";
//import { serveStatic } from "https://deno.land/x/hono@v4.0.7/middleware.ts";
import { z, createRoute, OpenAPIHono } from "npm:@hono/zod-openapi@0.9.5";
import YAML from "npm:js-yaml";
import { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";

export const app = new OpenAPIHono();

// static get pages using jsx here 
Index()

// --- Docs ---
const InputSchema = z.object({
    list: z.array(
        z.object({
            transport_form: z.enum(["truck", "plane", "boat"]),
            distance_km: z.number().openapi({ example: 178 }),
        })
    )
    .openapi({
        description: "List of objects that contains a 'transport_form' and its 'distance_km'",
        example: [
            { transport_form: "truck", distance_km: 100 },
            { transport_form: "plane", distance_km: 500 },
            { transport_form: "boat", distance_km: 300 }
        ],
    }),
})
.openapi("Input");

const OutputSchema = z.number();

const route = createRoute({
    method: "post",
    path: "/api/estimate",
    request: {
        params: InputSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: OutputSchema,
                },
            },
            description: "Retrieve total estimated emission",
        },
    },
});

app.openapi(
    route,
    (c) => {
        // TODO
        return c.json(1234);
    },
);

app.use("/doc/*", (async (c, next) => {
    await next();

    const yamlParam = c.req.query("yaml");
    if (yamlParam != null) {
        const obj = await c.res.json();
        const yaml = YAML.dump(obj);
        c.res = new Response(yaml, c.res);
    }
}));

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "IBM-SL",
    },
    servers: [
        {
            url: "localhost:8000",
            description: "Local server",
        },
        {
            url: "https://ibm-sl-api.deno.dev/",
            description: "Production server",
        }
    ],
});

app.get(
    "/doc/ui",
    swaggerUI({
        url: "/doc",
    }),
);

// --- API ---
const api = app.basePath('/api')

// api routes get/put 
api.post('/estimate', async (c) => {
    const body = await c.req.json()




    return c.json(10)
})

Deno.serve(app.fetch)
