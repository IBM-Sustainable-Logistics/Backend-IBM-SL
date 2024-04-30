import { z } from "npm:@hono/zod-openapi@0.9.5";
import { FromOrToSchema } from "./AddressSchema.ts";
import AddressSchema from "./AddressSchema.ts";

export const NoSuchAddressError = z.object({
  error: z.literal("No such address"),
  fromOrTo: FromOrToSchema,
});

export type NoSuchAddressType = z.infer<typeof NoSuchAddressError>;

export const AmbiguousAddressError = z.object({
  error: z.literal("Ambiguous address"),
  fromOrTo: FromOrToSchema,
  addresses: z.array(AddressSchema),
});

export type AmbiguousAddressType = z.infer<typeof AmbiguousAddressError>;

export const LocationErrorSchema = NoSuchAddressError.or(AmbiguousAddressError);

export type LocationErrorType = z.infer<typeof LocationErrorSchema>;

const LocationSchema = z.object({
  lat: z.number()
    .openapi({
      description: "The latitude of the location.",
    }),
  lon: z.number()
    .openapi({
      description: "The longitude of the location.",
    }),
})
.openapi({
  description: "The coordinates of a location.",
  examples: [
    { lat: 40.7128, lon: -74.0060 },
    { lat: 51.5074, lon: -0.1278 },
  ],
});

export type LocationType = z.infer<typeof LocationSchema>;

export default LocationSchema;
