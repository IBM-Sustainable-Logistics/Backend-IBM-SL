
import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { suggestCities } from "./suggest.ts";

Deno.test("suggest cities example test", { }, () => {
  assertEquals(suggestCities("city"),
    [
      { city: "City1", country: "Country1" },
      { city: "City2", country: "Country2" },
      { city: "City3", country: "Country3" },
    ]
  )
});

