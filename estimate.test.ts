
import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { estimateEmissions } from "./estimate.ts";

Deno.test("estimate emissions distances only", { }, async () => 
  assertEquals(await estimateEmissions([
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
  ]),
    {
      status: 200,
      total_kg: 896,
      stages: [
        { transport_form: "truck",      kg: 11, },
        { transport_form: "etruck",     kg: 14, },
        { transport_form: "train",      kg: 20, },
        { transport_form: "aircraft",   kg: 200, },
        { transport_form: "cargoship",  kg: 13, },
        { transport_form: "truck",      kg: 63, },
        { transport_form: "etruck",     kg: 49, },
        { transport_form: "train",      kg: 52, },
        { transport_form: "aircraft",   kg: 450, },
        { transport_form: "cargoship",  kg: 25, },
      ],
    }
  )
);

Deno.test("estimate emissions from-to city only", { permissions: { read: true, net: true } }, async () =>
  assertEquals(await estimateEmissions([
    { transport_form: "truck", from: { city: "Copenhagen", country: "Denmark" }, to: { city: "Hørsholm", country: "Denmark" } },
  ]),
    {
      status:   200,
      total_kg: 31,
      stages: [
        { transport_form: "truck", kg: 31 },
      ],
    }
  )
);

Deno.test("estimate emissions from-to city and country", { permissions: { read: true, net: true } }, async () =>
  assertEquals(await estimateEmissions([
    { transport_form: "truck", from: { city: "New York", country: "United States" }, to: { city: "Los Angeles", country: "United States" } },
  ]),
    {
      status:   200,
      total_kg: 4740,
      stages: [
        { transport_form: "truck", kg: 4740 },
      ],
    }
  )
);

Deno.test("estimate emissions from docs", { permissions: { read: true, net: true } }, async () => 
  assertEquals(await estimateEmissions([
    { transport_form: "truck",      distance_km: 100 },
    { transport_form: "truck",      from: { city: "New York", country: "United States" }, to: { city: "Los Angeles" } },
    { transport_form: "etruck",     distance_km: 100 },
    { transport_form: "train",      distance_km: 500 },
    { transport_form: "aircraft",   distance_km: 300 },
    { transport_form: "cargoship",  distance_km: 300 },
  ]),
    {
      status:   200,
      total_kg: 6816,
      stages: [
        { transport_form: "truck",      kg: 105 },
        { transport_form: "truck",      kg: 4740 },
        { transport_form: "etruck",     kg: 70 },
        { transport_form: "train",      kg: 325 },
        { transport_form: "aircraft",   kg: 1500 },
        { transport_form: "cargoship",  kg: 75 },
      ],
    }
  )
);
