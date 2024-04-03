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
  )).openapi({
    description:
      "The estimated emission for each `stage` as well as the total.",
    example: {
      status: 200,
      total_kg: 300,
      stages: [
        { kg: 100, transport_form: "truck" },
        { kg: 200, transport_form: "etruck" },
      ],
    },
  }),
});

export type OutputType = z.infer<typeof OutputSchema>;

export default OutputSchema;
