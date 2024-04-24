import { createRoute } from "npm:@hono/zod-openapi@0.9.5";
import ErrorSchema from "../components/schemas/ErrorSchema.ts";
import EstimationsSchema, { EstimationErrorSchema } from "../components/schemas/EstimationsSchema.ts";
import ChainSchema from "../components/schemas/ChainSchema.ts";

export const chainEstimateEmissions = createRoute({
  method: "post",
  path: "/api/estimate",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChainSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EstimationsSchema,
        },
      },
      description:
        "The estimated emission for each `stage` as well as the total.",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid input",
    },
    500: {
      content: {
        "application/json": {
          schema: EstimationErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
  description:
    "Accepts a `route` as an input. A `route` consists of one or multiple `stages`." +
    "The returned value is an object containing a `total_kg` that represents the total estimated emission for the given `route` and a list numbers representing the estimated emissions for each `stage`.",
});
