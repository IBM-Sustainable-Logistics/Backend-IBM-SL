import { z } from "npm:@hono/zod-openapi@0.9.5";
import { LocationErrorSchema } from "./LocationSchema.ts";
import { TransportFormEnum } from "./RouteSchema.ts";
import { RouteId } from "./ChainSchema.ts";
import AddressSchema from "./AddressSchema.ts";

export const ImpossibleStageError = z.object({
  error: z.literal("Could not connect locations"),
  route_id: RouteId,
  stage_index: z.number(),
  from: AddressSchema,
  to: AddressSchema,
});

export type ImpossibleStageType = z.infer<typeof ImpossibleStageError>;

export const EstimationErrorSchema = ImpossibleStageError.or(LocationErrorSchema);

export type EstimationErrorType = z.infer<typeof EstimationErrorSchema>;

const EstimationsSchema = z.object({
  chain_kg: z.number()
    .openapi({
      description: "The estimated emission for the whole `chain` in kilograms, " +
                   "i.e. the sum of each `route` (before rounding).",
      example: 217,
    }),
  routes: z.array(z.object({
    id: RouteId,
    route_kg: z.number()
      .openapi({
        description: "The estimated emission for the `route` in kilograms.",
      }),
    stages: z.array(z.object({
        stage_kg: z.number()
          .openapi({
            description: "The estimated emissions for this `stage`.",
          }),
        transport_form: TransportFormEnum,
    })),
  })),
})
.openapi({
  description:
    "The estimations for this chain as well as the total. " +
    "All the estimations are rounded to nearest integer, " +
    "though, to not lose too much precision, " +
    "the sums have been calculated before rounding.",
  example: {
    chain_kg: 7057,
    routes: [
      {
        id: "Primary Route",
        route_kg: 6713,
        stages: [
          { stage_kg: 105, transport_form: "truck" },
          { stage_kg: 4713, transport_form: "truck" },
          { stage_kg: 70, transport_form: "etruck" },
          { stage_kg: 325, transport_form: "train" },
          { stage_kg: 1500, transport_form: "aircraft" },
        ],
      },
      {
        id: "Secondary Route",
        route_kg: 344,
        stages: [
          { stage_kg: 134, transport_form: "etruck" },
          { stage_kg: 210, transport_form: "train" },
        ],
      },
    ]
  },
});

export type EstimationsType = z.infer<typeof EstimationsSchema>;

export default EstimationsSchema;
