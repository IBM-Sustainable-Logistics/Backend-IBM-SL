import { z } from "npm:@hono/zod-openapi@0.9.5";

const InputSchema = z.object({
  city: z.string()
    .openapi({
      description: "The city query.",
    }),
  country: z.optional(z.string())
    .openapi({
      description: "The country query that the city should be in. (Optional)",
    }),
})
.openapi({
  description: "The query that the auto suggestions should be based on.",
  examples: [
    { city: "New" },
    { city: "Copen", country: "Denmark" },
  ],
});

export type InputType = z.infer<typeof InputSchema>;

export default InputSchema;

