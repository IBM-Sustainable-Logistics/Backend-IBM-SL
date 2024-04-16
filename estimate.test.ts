import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { estimateEmissions } from "./estimate.ts";

Deno.test("estimate emissions distances only", { }, async () => 
  assertEquals(await estimateEmissions([
    {
      id: "Route 1",
      stages: [
        { transport_form: "truck",      distance_km:  10 },
        { transport_form: "etruck",     distance_km:  20 },
        { transport_form: "train",      distance_km:  30 },
        { transport_form: "aircraft",   distance_km:  40 },
        { transport_form: "cargoship",  distance_km:  50 },
        { transport_form: "truck",      distance_km:  60 },
        { transport_form: "etruck",     distance_km:  70 },
        { transport_form: "train",      distance_km:  80 },
        { transport_form: "aircraft",   distance_km:  90 },
        { transport_form: "cargoship",  distance_km: 100 },
      ]
    },
  ]),
    {
      chain_kg: 896,
      routes: [
        {
          id: "Route 1",
          route_kg: 896,
          stages: [
            { stage_kg: 11, transport_form: "truck" },
            { stage_kg: 14, transport_form: "etruck" },
            { stage_kg: 20, transport_form: "train" },
            { stage_kg: 200, transport_form: "aircraft" },
            { stage_kg: 13, transport_form: "cargoship" },
            { stage_kg: 63, transport_form: "truck" },
            { stage_kg: 49, transport_form: "etruck" },
            { stage_kg: 52, transport_form: "train" },
            { stage_kg: 450, transport_form: "aircraft" },
            { stage_kg: 25, transport_form: "cargoship" },
          ],
        },
      ],
    }
  )
);

Deno.test("estimate emissions from-to city only", { permissions: { read: true, net: true } }, async () =>
  assertEquals(await estimateEmissions([
    {
      id: "Route",
      stages: [
        { transport_form: "truck", from: { city: "Copenhagen", country: "Denmark" }, to: { city: "Hørsholm", country: "Denmark" } },
      ],
    },
  ]),
    {
      chain_kg: 31,
      routes: [
        {
          id: "Route",
          route_kg: 31,
          stages: [
            { stage_kg: 31, transport_form: "truck" },
          ],
        }
      ],
    }
  )
);

Deno.test("estimate emissions from-to city and country", { permissions: { read: true, net: true } }, async () =>
  assertEquals(await estimateEmissions([
    {
      id: "Route using addresses",
      stages: [
      { transport_form: "truck", from: { city: "New York", country: "United States" }, to: { city: "Los Angeles", country: "United States" } },
      ],
    },
  ]),
    {
      chain_kg: 4740,
      routes: [
        {
          id: "Route using addresses",
          route_kg: 4740,
          stages: [
            { stage_kg: 4740, transport_form: "truck" },
          ],
        }
      ],
    }
  )
);

Deno.test("estimate emissions from docs", { permissions: { read: true, net: true } }, async () => 
  assertEquals(await estimateEmissions([
    {
      id: "Example Route",
      stages: [
        { transport_form: "truck",      distance_km: 100 },
        { transport_form: "truck",      from: { city: "New York", country: "United States" }, to: { city: "Los Angeles" } },
        { transport_form: "etruck",     distance_km: 100 },
        { transport_form: "train",      distance_km: 500 },
        { transport_form: "aircraft",   distance_km: 300 },
        { transport_form: "cargoship",  distance_km: 300 },
      ],
    },
  ]),
    {
      chain_kg: 6816,
      routes: [
        {
          id: "Example Route",
          route_kg: 6816,
          stages: [
            { stage_kg: 105, transport_form: "truck" },
            { stage_kg: 4740, transport_form: "truck" },
            { stage_kg: 70, transport_form: "etruck" },
            { stage_kg: 325, transport_form: "train" },
            { stage_kg: 1500, transport_form: "aircraft" },
            { stage_kg: 75, transport_form: "cargoship" },
          ],
        }
      ],
    },
  )
);

Deno.test("estimate impossible route", { permissions: { read: true, net: true } }, async () =>
  assertEquals(await estimateEmissions([
    {
      id: "Impossible Route",
      stages: [
        {
          transport_form: "truck",
          from: { city: "Copenhagen", country: "Denmark" },
          to: { city: "Sydney", country: "Australia" },
        },
      ],
    },
  ]),
    {
      status: 400,
      error: "Could not connect locations",
    }
  )
);
