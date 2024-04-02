
import YAML from "npm:js-yaml";
import { Index } from "./pages/index.tsx";
import { OpenAPIHono } from "npm:@hono/zod-openapi@0.9.5";
export const app = new OpenAPIHono();

import { routeEstimateEmissions } from "./routes/estimate.ts";
import { routeSuggestCities } from "./routes/suggest.ts";
import { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";

import { estimateEmissions } from "./estimate.ts";
import { suggestCities } from "./suggest.ts";

// --- API ---

// static get pages using jsx here
Index();

app.openapi(
  routeEstimateEmissions,
  async (c) => c.json(await estimateEmissions(await c.req.json())),
);

app.openapi(
  routeSuggestCities,
  async (c) => c.json(suggestCities(await c.req.json())),
);

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
