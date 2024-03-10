import {  createRoute } from "npm:@hono/zod-openapi@0.9.5";
import InputSchema from "../components/schemas/InputSchema.ts";
import OutputSchema from "../components/schemas/OutputSchema.ts";
import ErrorSchema from "../components/schemas/ErrorSchema.ts";

export const estimateRoute = createRoute({
    method: "post",
    path: "/api/estimate",
    request: {
        body: {
            content: {
                "application/json": {
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
            description: "The estimated emission for each `stage` as well as the total.",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorSchema,
                },
            },
            description: "Returns an error",
        },
    },
    description:
        "Accepts a `route` as an input. A `route` consists of one or multiple `stages`. Each `stage` has a `transport_form` and a `distance_km`." +
        "The returned value is an object containing a `total_kg` that represents the total estimated emission for the given `route` and a list numbers representing the estimated emissions for each `stage`.",
});
