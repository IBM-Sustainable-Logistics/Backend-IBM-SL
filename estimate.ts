import { ErrorType } from "./components/schemas/ErrorSchema.ts";
import { RouteType, TransportForm } from "./components/schemas/RouteSchema.ts";
import { EstimationsType } from "./components/schemas/EstimationsSchema.ts";
import { AddressType } from "./components/schemas/AddressSchema.ts";
import { LocationType } from "./components/schemas/LocationSchema.ts";
import { getDistance } from "./bingmaps.ts";
import { getWorldCities } from "./citylist.ts";

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

export async function estimateEmissions(
  input: RouteType,
): Promise<EstimationsType | ErrorType> {
  let total_kg = 0;

  const stages: { kg: number; transport_form: TransportForm }[] = [];
  for (let i = 0; i < input.length; i++) {
    const stage = input[i];

    const emissionFactor = emissionFactors[stage.transport_form];
    const cargoWeight = 10;

    if ("distance_km" in stage) {
      const emission = emissionFactor * stage.distance_km * cargoWeight;
      total_kg += emission;

      stages[i] = {
        kg: Math.round(emission),
        transport_form: stage.transport_form,
      };
    } else {
      const from = getLocation(stage.from, "from");
      if ("error" in from) {
        return from;
      }

      const to = getLocation(stage.to, "to");
      if ("error" in to) {
        return to;
      }

      const response = await getDistance(from, to);

      if ("error" in response) {
        return response;
      }

      const emission = emissionFactor * response.distance_km * cargoWeight;
      total_kg += emission;

      stages[i] = {
        kg: Math.round(emission),
        transport_form: stage.transport_form,
      };
    }
  }

  return {
    status: 200,
    total_kg: Math.round(total_kg),
    stages: stages,
  };
}

function getLocation(
  address: AddressType,
  label: string,
): LocationType | ErrorType {
  const locations = getWorldCities().getLocations(address);

  if (locations.length === 0) {
    return {
      status: 400,
      error: "No such '" + label + "' address",
    };
  }

  if (locations.length > 1) {
    return {
      status: 400,
      error: "Multiple cities found for '" + label + "', please specify country.",
    };
  }

  return locations[0];
}
