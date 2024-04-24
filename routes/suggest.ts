import { createRoute } from "npm:@hono/zod-openapi@0.9.5";
import AddressSchema from "../components/schemas/AddressSchema.ts";
import SuggestionsSchema from "../components/schemas/SuggestionsSchema.ts";
import ErrorSchema from "../components/schemas/ErrorSchema.ts";

export const routeSuggestCities = createRoute({
  method: "post",
  path: "/api/suggest",
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
      description: "A list of suggestions for the `city` and `country` fields.",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid input",
    },
  },
  description:
    "Accepts an address object which consists of a `city` and a `country` field. " +
    "The two fields can be incomplete or empty. " +
    "The response is a list of suggestions for the `city` and `country` fields, " +
    "where the suggestions strictly matches the start of the input fields.",
});
