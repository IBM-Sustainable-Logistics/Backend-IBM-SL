
import { z} from "npm:@hono/zod-openapi@0.9.5";

export const ErrorSchema = z.object({
    code: z.number().openapi({
      example: 400,
    }),
    message: z.string().openapi({
      example: 'Bad Request',
    }),
  })