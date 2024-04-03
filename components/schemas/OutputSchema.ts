import { z } from "npm:@hono/zod-openapi@0.9.5";
const OutputSchema = z.object({
  status: z.number()
    .openapi({ example: 200 }),
  total_kg: z.number()
    .openapi({
      description:
        "The estimated emission for the whole route in kilograms, i.e. the sum of each `stage`.",
    }),
  stages: z.array(z.object(
    {
      kg: z.number()
        .openapi({
          description: "A list of the estimated emissions for each `stage`.",
        }),
      transport_form: z.string().openapi({
        description: "The vehicle type that is used in this `stage`.",
      }),
    },
  )).openapi(
    {
      description: "A list of the estimated emissions for each `stage`.",
      example: [
        { kg: 105, transport_form: "truck" },
        { kg: 4713, transport_form: "truck" },
        { kg: 70, transport_form: "etruck" },
        { kg: 325, transport_form: "train" },
        { kg: 1500, transport_form: "aircraft" },
      ],
    },
  ),
});

export type OutputType = z.infer<typeof OutputSchema>;

export default OutputSchema;
