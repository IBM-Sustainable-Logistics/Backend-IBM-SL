import { createRoute } from "npm:@hono/zod-openapi@0.9.5";
import InputSchema from "../components/schemas/SuggestInputSchema.ts";
import OutputSchema from "../components/schemas/SuggestOutputSchema.ts";
import ErrorSchema from "../components/schemas/SuggestErrorSchema.ts";

export const routeSuggestCities = createRoute({
  method: "post",
  path: "/api/suggest",
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
      "application/json": {
        schema: OutputSchema,
      },
      description: "TODO: Add description",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns and error",
    },
  },
  description: "TODO: Add description",
});
