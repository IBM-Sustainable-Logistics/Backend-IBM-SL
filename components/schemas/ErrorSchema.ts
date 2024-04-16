import { z } from "npm:@hono/zod-openapi@0.9.5";
import { StatusCode } from "https://deno.land/x/hono@v4.0.7/utils/http-status.ts";

export type WithStatus<Code = StatusCode> = {
  status: Code,
};

const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Error fetching data" }),
})
.openapi({
  description: "An error response.",
  example: { error: "No results found" },
});

export type ErrorType = z.infer<typeof ErrorSchema>;

export default ErrorSchema;
