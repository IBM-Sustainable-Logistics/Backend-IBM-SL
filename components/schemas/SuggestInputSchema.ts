import { z } from "npm:@hono/zod-openapi@0.9.5";

const InputSchema =
  z.string()
  .openapi({
    description: "The city query.",
    example: "Copenhagen",
  });

export type InputType = z.infer<typeof InputSchema>;

export default InputSchema;

