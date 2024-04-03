import { z } from "npm:@hono/zod-openapi@0.9.5";

const SuggestionsSchema = z.array(
  z.object({
    city: z.string()
    .openapi({
      description: "A city suggestion.",
    }),
    country: z.string()
      .openapi({
        description: "The country of the city suggestion.",
      }),
  })
)
.openapi({
  description: "A list of city suggestions and their countries",
});

export type SuggestionsType = z.infer<typeof SuggestionsSchema>;

export default SuggestionsSchema;

