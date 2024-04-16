import { LocationType } from "./components/schemas/LocationSchema.ts";
import { ErrorType, WithStatus } from "./components/schemas/ErrorSchema.ts";
import { load } from "https://deno.land/std@0.219.0/dotenv/mod.ts";

const bingMapsKey = (await load()).BING_MAPS_KEY ||
  Deno.env.get("BING_MAPS_KEY");

export async function getDistance(
  from: LocationType,
  to: LocationType,
): Promise<
  | { distance_km: number }
  | ErrorType & WithStatus<400 | 500>
  | "Could not connect locations"
> {
  if (bingMapsKey === undefined) {
    return { status: 500, error: "Bing Maps API key not found" };
  }

  const travelMode: "Walking" | "Driving" | "Transit" = "Driving";

  const url = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix" +
    "?origins=" + from.lat + "," + from.lon +
    "&destinations=" + to.lat + "," + to.lon +
    "&travelMode=" + travelMode +
    "&key=" + bingMapsKey;

  const response = await fetch(url, { method: "GET" });

  const json = await response.json();

  if (json.statusCode !== 200) {
    return { status: 500, error: "Error fetching data" };
  }

  if (json.resourceSets[0].estimatedTotal == 0) {
    return { status: 400, error: "No results found" };
  }

  const distance_km =
    json.resourceSets[0].resources[0].results[0].travelDistance;

  if (distance_km < 0) {
    return "Could not connect locations";
  }

  return { distance_km: distance_km };
}
