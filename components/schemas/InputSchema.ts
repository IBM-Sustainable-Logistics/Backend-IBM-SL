import { z } from "npm:@hono/zod-openapi@0.9.5";

const transportFormEnum =
  z.enum([ "truck", "etruck", "train", "aircraft", "cargoship"])
  .openapi({
    description: "The vehicle type that is used in this `stage`.",
  });

const truckFormEnum =
  z.enum(["truck", "etruck"])
  .openapi({
    description: "The vehicle type that is used in this `stage`.",
  });

export type TransportForm = z.infer<typeof transportFormEnum>;
export type TruckForm = z.infer<typeof truckFormEnum>;

const InputSchema = z.array(
  z.object({
    transport_form: transportFormEnum,
    distance_km: z.number()
      .openapi({
        description: "The distance of this `stage` of the route in kilometers.",
      }),
  }).or(z.object({
    transport_form: truckFormEnum,
    from: z.string()
      .openapi({
        description: "The address of the starting point of this `stage`.",
      }),
    to: z.string()
      .openapi({
        description: "The address of the destination of this `stage`.",
      }),
  }))
  .openapi({
    description:
      "A `stage` that contains a `transport_form` and either a `distance_km` or `from` and `to`.",
    example: { transport_form: "truck", distance_km: 100 },
  }),
)
.openapi({
  description: "List of objects that each represents a `stage` of the route.",
  example: [
    { transport_form: "truck", distance_km: 100 },
    { transport_form: "truck", from: "New York", to: "Los Angeles" },
    { transport_form: "etruck", distance_km: 100 },
    { transport_form: "train", distance_km: 500 },
    { transport_form: "aircraft", distance_km: 300 },
    { transport_form: "cargoship", distance_km: 300 },
  ],
});

export type InputType = z.infer<typeof InputSchema>;

export default InputSchema;
