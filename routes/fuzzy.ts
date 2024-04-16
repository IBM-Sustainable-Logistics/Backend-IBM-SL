import { createRoute } from "npm:@hono/zod-openapi@0.9.5";
import AddressSchema from "../components/schemas/AddressSchema.ts";
import SuggestionsSchema from "../components/schemas/SuggestionsSchema.ts";
import ErrorSchema from "../components/schemas/ErrorSchema.ts";

export const routeSuggestCitiesFuzzy = createRoute({
  method: "post",
  path: "/api/fuzzy",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddressSchema,
        },
      },
    },
  },
  responses: {
    200: {
      "application/json": {
        schema: SuggestionsSchema,
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
