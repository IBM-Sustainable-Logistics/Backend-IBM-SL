import { z } from "npm:@hono/zod-openapi@0.9.5";

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
