import { z } from "npm:@hono/zod-openapi@0.9.5";

const OutputSchema = z.array(
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

export type OutputType = z.infer<typeof OutputSchema>;

export default OutputSchema;

