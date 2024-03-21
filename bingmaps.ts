
import { ErrorType } from "./components/schemas/ErrorSchema.ts";
import { load } from "https://deno.land/std@0.219.0/dotenv/mod.ts";

const bingMapsKey = (await load()).BING_MAPS_KEY || Deno.env.get("BING_MAPS_KEY");

type GetLocationType = {
  lat: number;
  lon: number;
  address: string;
};

async function getLocation(query: string): Promise<GetLocationType | ErrorType> {
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

  if (json.resourceSets[0].estimatedTotal === 0) {
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

type GetDistanceType = {
  distance_km: number;
  from: string;
  to: string;
};

export async function getDistance(from: string, to: string): Promise<GetDistanceType | ErrorType> {
  if (bingMapsKey === undefined) {
    return { status: 500, error: "Bing Maps API key not found" };
  }

  const fromLoc = await getLocation(from);

  if ("error" in fromLoc) {
    return fromLoc;
  }

  const toLoc = await getLocation(to);

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
