import { z } from "npm:@hono/zod-openapi@0.9.5";
import AddressSchema from "./AddressSchema.ts";

const truckForms = [
  "truck", "etruck",
] as const;

const transportForms = [
  ...truckForms, "train", "aircraft", "cargoship"
] as const;

export const TruckFormEnum =
  z.enum(truckForms)
  .openapi({
    description: "The vehicle type that is used in this `stage`.",
  });

export const TransportFormEnum =
  z.enum(transportForms)
  .openapi({
    description: "The vehicle type that is used in this `stage`.",
  });

export type TruckForm = z.infer<typeof TruckFormEnum>;
export type TransportForm = z.infer<typeof TransportFormEnum>;

export const CargoWeightSchema =
  z.number()
  .openapi({
    description: "The weight of the cargo of this `stage` in tons.",
  })

export const DistanceSchema =
  z.number()
  .openapi({
    description: "The distance of this `stage` of the route in kilometers.",
  })

const RouteSchema = z.array(
  z.object({
    transport_form: TransportFormEnum,
    distance_km: z.number()
      .openapi({
        description: "The distance of this `stage` of the route in kilometers.",
      }),
  })
  .or(z.object({
    transport_form: TruckFormEnum,
    from: AddressSchema
      .openapi({
        description: "The address of the starting point of this `stage`.",
      }),
    to: AddressSchema
      .openapi({
        description: "The address of the destination of this `stage`.",
      }),
  }))
  .and(z.object({
    cargo_t: z.optional(CargoWeightSchema),
  }))
  .openapi({
    description: "A `stage` that contains a `transport_form` and either a " +
                 "`distance_km` or `from` and `to`.",
    example: { transport_form: "truck", distance_km: 100 },
  }),
)
.openapi({
  description: "List of objects that each represents a `stage` of the `route`.",
  example: [
    { transport_form: "truck", distance_km: 100 },
    {
      transport_form: "truck",
      from: { city: "New York", country: "United States" },
      to: { city: "Los Angeles", }
    },
    { transport_form: "etruck", cargo_t: 10, distance_km: 100 },
    { transport_form: "train", cargo_t: 50, distance_km: 500 },
    { transport_form: "aircraft", cargo_t: 2, distance_km: 300 },
    { transport_form: "cargoship", distance_km: 300 },
  ],
});

export type RouteType = z.infer<typeof RouteSchema>;

export default RouteSchema;
