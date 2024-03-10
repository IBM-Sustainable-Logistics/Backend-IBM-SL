

import { Index } from "./pages/index.tsx";
import { z, OpenAPIHono } from "npm:@hono/zod-openapi@0.9.5";
import YAML from "npm:js-yaml";
import { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";
import { estimateRoute } from "./routes/estimate.ts";
import InputSchema from "./components/schemas/InputSchema.ts";
import OutputSchema from "./components/schemas/OutputSchema.ts";

export const app = new OpenAPIHono();

// static get pages using jsx here 
Index()

// --- API ---

const emissionFactors = {
  truck: 2.68,      // kg CO2e per km
  cargoship: 3.2,   // kg CO2e per km
  aircraft: 2.52,   // kg CO2e per km
  train: 2.68,      // kg CO2e per km
} as const;

const fuelEfficiencies = {
  truck: 0.2,       // L/km
  cargoship: 0.02,  // tonnes/km
  aircraft: 0.15,   // L/km per seat (assuming full occupancy for simplification)
  train: 0.1,       // L/km
} as const;

app.openapi(estimateRoute, (c) => {
  const input = InputSchema.parse(c.req.json());
  console.log(input);

  let total_kg = 0;

  const stages = input.map(stage => {
    const emissionFactor = emissionFactors[stage.transport_form];
    const fuelEfficiency = fuelEfficiencies[stage.transport_form];

    const emission = emissionFactor * stage.distance_km * fuelEfficiency;
    total_kg += emission;

    return emission;
  });

  const output: z.infer<typeof OutputSchema> = {
    total_kg: Math.round(total_kg),
    stages: stages,
  };

  return c.json(output);
});

// --- Docs ---

app.use("/doc/*", async (c, next) => {
    await next();

    const yamlParam = c.req.query("yaml");
    if (yamlParam != null) {
        const obj = await c.res.json();
        const yaml = YAML.dump(obj);
        c.res = new Response(yaml, c.res);
    }
});

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "IBM-SL",
    },
    servers: [
        {
            url: "https://ibm-sl-api.deno.dev/",
            description: "Production server",
        },
        {
            url: "http://localhost:8000",
            description: "Local server",
        }
    ],
});

app.get(
    "/doc/ui",
    swaggerUI({
        url: "/doc",
    }),
);

Deno.serve(app.fetch)

