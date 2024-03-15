import YAML from "npm:js-yaml";
import { Index } from "./pages/index.tsx";
import { OpenAPIHono, z } from "npm:@hono/zod-openapi@0.9.5";
export const app = new OpenAPIHono();

import { estimateRoute } from "./routes/estimate.ts";
import InputSchema from "./components/schemas/InputSchema.ts";
import OutputSchema from "./components/schemas/OutputSchema.ts";
import { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";

import { load } from "https://deno.land/std@0.219.0/dotenv/mod.ts";

// --- Bing Maps ---
const bingMapsKey = (await load()).BING_MAPS_KEY || Deno.env.get("BING_MAPS_KEY");

async function bingMapsGetLocation(
  query: string,
): Promise<
  { lat: number; lon: number; address: string } | {
    "status": number;
    "error": string;
  }
> {
  const maxResults = 1;

  const response = await fetch(
    "http://dev.virtualearth.net/REST/v1/Locations/" + query +
      "?maxResults=" + maxResults +
      "&key=" + bingMapsKey,
    {
      method: "GET",
    },
  );

  const json = await response.json();

  if (json.statusCode !== 200) {
    return { status: 500, error: "Error fetching data" };
  }

  if (json.resourceSets[0].estimatedTotal == 0) {
    return { status: 404, error: "No results found" };
  }

  const coords: number[] = json.resourceSets[0].resources[0].point.coordinates;

  if (coords.length !== 2) {
    return { status: 500, error: "Invalid coordinates" };
  }

  return {
    lat: coords[0],
    lon: coords[1],
    address: json.resourceSets[0].resources[0].address.formattedAddress,
  };
}

async function bingMapsGetDistance(
  from: string,
  to: string,
): Promise<
  { distance_km: number; from: string; to: string } | {
    "status": number;
    "error": string;
  }
> {
  if (bingMapsKey === undefined) {
    return { status: 500, error: "Bing Maps API key not found" };
  }

  const fromLoc = await bingMapsGetLocation(from);

  if ("error" in fromLoc) {
    return fromLoc;
  }

  const toLoc = await bingMapsGetLocation(to);

  if ("error" in toLoc) {
    return toLoc;
  }

  const travelMode: "Walking" | "Driving" | "Transit" = "Driving";

  const response = await fetch(
    "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix" +
      "?origins=" + fromLoc.lat + "," + fromLoc.lon +
      "&destinations=" + toLoc.lat + "," + toLoc.lon +
      "&travelMode=" + travelMode +
      "&key=" + bingMapsKey,
    {
      method: "GET",
    },
  );

  const json = await response.json();

  if (json.statusCode !== 200) {
    return { status: 500, error: "Error fetching data" };
  }

  if (json.resourceSets[0].estimatedTotal == 0) {
    return { status: 400, error: "No results found" };
  }

  const distance_km =
    json.resourceSets[0].resources[0].results[0].travelDistance;

  return {
    distance_km: distance_km,
    from: fromLoc.address,
    to: toLoc.address,
  };
}

// --- API ---

// static get pages using jsx here
Index();

const transportFormEnum = InputSchema.element.options[0].shape.transport_form;
type TransportForm = z.infer<typeof transportFormEnum>;

// Emission factors use the unit kg CO2e per km for 1 ton of cargo.
const emissionFactors: { [key in TransportForm]: number } = {
    // Source: https://publications.jrc.ec.europa.eu/repository/handle/JRC112015
    // Class 9 truck emits 136 gCO2/tkm for Long-Haul missions

    // Source: https://8billiontrees.com/carbon-offsets-credits/carbon-ecological-footprint-calculators/truck-co2-emissions-per-km-calculator/
    truck: 0.105,
    etruck: 0.105 * (1 - 0.33), // emits a third less https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8350515/
    cargoship: 0.025,
    aircraft: 0.500,
    train: 0.065,
} as const;

// const emissionFactors = {
//   truck: 2.68, // kg CO2e per km
//   cargoship: 3.2, // kg CO2e per km
//   aircraft: 2.52, // kg CO2e per km
//   train: 2.68, // kg CO2e per km
// } as const;

// const fuelEfficiencies = {
//   truck: 0.2, // L/km
//   cargoship: 0.02, // tonnes/km
//   aircraft: 0.15, // L/km per seat (assuming full occupancy for simplification)
//   train: 0.1, // L/km
// } as const;

app.openapi(estimateRoute, async (c) => {
  const input = InputSchema.parse(c.req.json());

  let total_kg = 0;

  const stages: number[] = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const stage = input[i];

    const emissionFactor = emissionFactors[stage.transport_form];
    const cargoWeight = 10;

    if ("distance_km" in stage) {
      const emission = emissionFactor * stage.distance_km * cargoWeight;
      total_kg += emission;

      stages[i] = Math.round(emission);
    } else {
      const response = await bingMapsGetDistance(stage.from, stage.to);

      if ("status" in response) {
        return c.json(response);
      }

      const emission = emissionFactor * response.distance_km * cargoWeight;
      total_kg += emission;

      stages[i] = Math.round(emission);
    }
  }

  const output: z.infer<typeof OutputSchema> = {
    status: 200,
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
    },
  ],
});

app.get(
  "/doc/ui",
  swaggerUI({
    url: "/doc",
  }),
);

Deno.serve(app.fetch);
