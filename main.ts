

import { Index } from "./pages/index.tsx";
import { z, createRoute, OpenAPIHono } from "npm:@hono/zod-openapi@0.9.5";
import YAML from "npm:js-yaml";
import { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";
import { estimateRoute } from "./routes/estimate.ts";

export const app = new OpenAPIHono();

// static get pages using jsx here 
Index()

// --- Docs ---


app.openapi(estimateRoute, async (c) => {

    const emissionFactors = {
        truck: 2.68, // kg CO2e per km
        cargoship: 3.2, // kg CO2e per km
        aircraft: 2.52, // kg CO2e per km
        train: 2.68, // kg CO2e per km
    };

    const fuelEfficiency = {
        truck: 0.2, // L/km
        cargoship: 0.02, // tonnes/km
        aircraft: 0.15, // L/km per seat (assuming full occupancy for simplification)
        train: 0.1, // L/km
    };

    const body = await c.req.json();

    console.log(body)

    let totalEmission = 0;

    body.list.forEach(e => {
        const emissionFactor = emissionFactors[e.transport_form];
        const fuelEff = fuelEfficiency[e.transport_form];
        totalEmission += (emissionFactor * e.distance_km * fuelEff);
    });

    return c.json(Math.round(totalEmission) );
})


app.use("/doc/*", (async (c, next) => {
    await next();

    const yamlParam = c.req.query("yaml");
    if (yamlParam != null) {
        const obj = await c.res.json();
        const yaml = YAML.dump(obj);
        c.res = new Response(yaml, c.res);
    }
}));

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

// --- API ---

// api routes get/put 

Deno.serve(app.fetch)
