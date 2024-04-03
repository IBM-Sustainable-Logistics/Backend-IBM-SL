import { z } from "npm:@hono/zod-openapi@0.9.5";

const AddressSchema = z.object({
  city: z.string()
    .openapi({
      description: "The city query.",
      example: "New York",
    }),
  country: z.optional(
      z.string()
      .openapi({
        example: "United States"
      })
    )
    .openapi({
      description: "The country query that the city should be in. (Optional)",
      examples: [
        undefined,
        "United",
        "United States",
      ],
    }),
})
.openapi({
  description: "An address containing a city and optionally a country.",
  examples: [
    { city: "New" },
    { city: "Copen", country: "Denmark" },
  ],
});

export type AddressType = z.infer<typeof AddressSchema>;

export default AddressSchema;

