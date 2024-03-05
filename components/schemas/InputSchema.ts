
import { z } from "npm:@hono/zod-openapi@0.9.5";


export const InputSchema = z.object({
    list: z.array(
        z.object({
            transport_form: z.enum(["truck", "train", "aircraft", "cargoship"]),
            distance_km: z.number(),
        })
    )
    .openapi({
        description: "List of objects that contains a 'transport_form' and its 'distance_km'",
        example: [
            { transport_form: "truck", distance_km: 100 },
            { transport_form: "train", distance_km: 500 },
            { transport_form: "aircraft", distance_km: 300 },
            { transport_form: "cargoship", distance_km: 300 }
        ],
    }),
})