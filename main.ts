

import { Index } from "./pages/index.tsx";
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
            distance_km: z.number(),
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

const ErrorSchema = z.object({
    code: z.number().openapi({
      example: 400,
    }),
    message: z.string().openapi({
      example: 'Bad Request',
    }),
  })

const OutputSchema = {
    estimate: z.number().openapi({
        example: 1000,
    }),
};

const route = createRoute({
    method: "post",
    path: "/api/estimate",
    request: {
        body: {
            content: {
                'application/json': {
                    schema: InputSchema,
                },
            },
        },
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
        400: {
            content: {
              'application/json': {
                schema: ErrorSchema,
              },
            },
            description: 'Returns an error',
          },
        },

    },
);

app.openapi(route, (c) => {
    const { body } =  c.req.arrayBuffer() as any;


    console.log(body);
    return c.json({ estimate: 1000 });
})


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
            url: "https://ibm-sl-api.deno.dev/",
            description: "Production server",
        },
        {
            url: "http://localhost:8000",
            description: "Local server",
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

// api routes get/put 

Deno.serve(app.fetch)
