import {  createRoute } from "npm:@hono/zod-openapi@0.9.5";
import { InputSchema } from "../components/schemas/InputSchema.ts";
import { OutputSchema } from "../components/schemas/OutputSchema.ts";
import { ErrorSchema } from "../components/schemas/ErrorSchema.ts";


export const estimateRoute = createRoute({
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