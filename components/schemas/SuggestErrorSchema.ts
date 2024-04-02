import { z } from "npm:@hono/zod-openapi@0.9.5";

const ErrorSchema = z.object({
  status: z.number().openapi({ example: 500 }),
  error: z.string().openapi({ example: "TODO: Example" }),
})
.openapi({
  description: "An error response.",
  example: { status: 400, error: "TODO: Example" },
});

export type ErrorType = z.infer<typeof ErrorSchema>;

export default ErrorSchema;
