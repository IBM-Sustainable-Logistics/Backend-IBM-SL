import { z } from "npm:@hono/zod-openapi@0.9.5";
import RouteSchema from "./RouteSchema.ts";

export const RouteId = z.string()
  .openapi({
    description: "A identifier that uniquely identifies a `route`.",
    example: "Route 1",
  });

const ChainSchema = z.array(
  z.object({
    id: z.string(),
    stages: RouteSchema,
  }),
)
.openapi({
  description: "Set of objects that each represents a `route` of a `chain`.",
  example: [
    {
      id: "Primary Route",
      stages: [
        {
          transport_form: "truck",
          cargo_t: 10,
          distance_km: 225,
        },
        {
          transport_form: "truck",
          from: { city: "Copenhagen" },
          to: { city: "Hamburg", country: "Germany", },
        },
      ],
    },
  ],
});

export type ChainType = z.infer<typeof ChainSchema>;

export default ChainSchema;
