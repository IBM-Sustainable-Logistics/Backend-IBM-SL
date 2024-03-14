
import { z} from "npm:@hono/zod-openapi@0.9.5";

const ErrorSchema = z.object({
    status: z.number().openapi({ example: 500, }),
    error: z.string().openapi({ example: "Error fetching data", }),
})
.openapi({
    description: "An error response.",
    example: { status: 400, error: "No results found" },
});

export default ErrorSchema;
