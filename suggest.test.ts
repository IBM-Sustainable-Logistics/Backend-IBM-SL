
import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { suggestCities } from "./suggest.ts";

Deno.test("suggest cities 'Empty'", { }, () => {
  assertEquals(suggestCities({ city: "Empty" }), []);
});

Deno.test("suggest cities ','", { }, () => {
  assertEquals(suggestCities({ city: "", country: "" }),
    [
      { city: "Tokyo", country: "Japan", },
      { city: "Tokorozawa", country: "Japan", },
      { city: "Tokoroa", country: "New Zealand", },
      { city: "Tokoname", country: "Japan", },
      { city: "Tokushima", country: "Japan", },
      { city: "Tokunoshima", country: "Japan", },
      { city: "Tokat", country: "Turkey", },
      { city: "Tokatippa", country: "India", },
      { city: "Tokha", country: "Nepal", },
      { city: "Toki", country: "Japan", },
    ]
  );
});

Deno.test("suggest cities 'Copen, Denmark'", { }, () => {
  assertEquals(suggestCities({ city: "Copen", country: "Denmark" }),
    [
      { city: "Copenhagen", country: "Denmark" },
    ]
  );
});

Deno.test("suggest cities 'Tok, Jap'", { }, () => {
  assertEquals(suggestCities({ city: "Tok", country: "Jap" }),
    [
      { city: "Tokyo", country: "Japan", },
      { city: "Tokorozawa", country: "Japan", },
      { city: "Tokoname", country: "Japan", },
      { city: "Tokushima", country: "Japan", },
      { city: "Tokunoshima", country: "Japan", },
      { city: "Toki", country: "Japan", },
      { city: "Tokigawa", country: "Japan", },
    ]
  );
});

Deno.test("suggest cities 'Union'", { }, () => {
  assertEquals(suggestCities({ city: "Union" }),
    [
      { city: "Union", country: "United States" },
      { city: "Union City", country: "United States" },
      { city: "Union Hill-Novelty Hill", country: "United States" },
      { city: "Union Park", country: "United States" },
      { city: "Uniondale", country: "United States" },
      { city: "Uniontown", country: "United States", },
    ]
  );
});

Deno.test("suggest cities 'New'", { }, () => {
  assertEquals(suggestCities({ city: "New" }),
    [
      { city: "New York", country: "United States", },
      { city: "New Orleans", country: "United States", },
      { city: "New Haven", country: "United States", },
      { city: "New Hartford", country: "United States", },
      { city: "New Hamburg", country: "Canada", },
      { city: "New Hanover", country: "United States", },
      { city: "New Hope", country: "United States", },
      { city: "New Hyde Park", country: "United States", },
      { city: "New Delhi", country: "India", },
      { city: "New Bedford", country: "United States" },
    ]
  );
});

