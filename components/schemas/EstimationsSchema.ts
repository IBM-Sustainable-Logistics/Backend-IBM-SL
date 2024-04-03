import { z } from "npm:@hono/zod-openapi@0.9.5";
import { TransportFormEnum } from "./RouteSchema.ts";

const EstimationsSchema = z.object({
  status: z.number()
    .openapi({ example: 200 }),
  total_kg: z.number()
    .openapi({
      description:
        "The estimated emission for the whole route in kilograms, i.e. the sum of each `stage`.",
    }),
  stages: z.array(z.object({
      kg: z.number()
        .openapi({
          description: "The estimated emissions for this `stage`.",
        }),
      transport_form: TransportFormEnum,
  }))
})
.openapi({
  description:
  "The estimated emission for each `stage` as well as the total.",
  example: {
    status: 200,
    total_kg: 300,
    stages: [
      { kg: 100, transport_form: "truck" },
      { kg: 200, transport_form: "etruck" },
    ],
  },
});

export type EstimationsType = z.infer<typeof EstimationsSchema>;

export default EstimationsSchema;
