
import { z} from "npm:@hono/zod-openapi@0.9.5";

const ErrorSchema = z.object({
    status: z.number().openapi({
      example: 400,
    }),
    error: z.string().openapi({
      example: 'Bad Request',
    }),
});

export default ErrorSchema;
