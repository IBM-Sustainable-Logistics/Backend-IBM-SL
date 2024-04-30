import { ErrorType, WithStatus } from "./components/schemas/ErrorSchema.ts";
import { TransportForm } from "./components/schemas/RouteSchema.ts";
import { ChainType } from "./components/schemas/ChainSchema.ts";
import {
  EstimationErrorType,
  EstimationsType,
} from "./components/schemas/EstimationsSchema.ts";
import { AddressType, FromOrToType } from "./components/schemas/AddressSchema.ts";
import { LocationErrorType, LocationType } from "./components/schemas/LocationSchema.ts";
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

type Stage = {
  stage_kg: number;
  transport_form: TransportForm;
};

type Route = {
  id: string;
  route_kg: number;
  stages: Stage[];
};

type Chain = {
  chain_kg: number;
  routes: Route[];
};

export async function estimateEmissions(
  input: ChainType,
): Promise<
  | EstimationsType
  | ErrorType & WithStatus<500>
  | EstimationErrorType & WithStatus<400>
> {
  const outputChain: Chain = { chain_kg: 0, routes: [] };

  for (let routeIndex = 0; routeIndex < input.length; routeIndex++) {
    const inputRoute = input[routeIndex];

    const outputRoute: Route = { id: inputRoute.id, route_kg: 0, stages: [] };
    outputChain.routes.push(outputRoute);

    for (
      let stageIndex = 0;
      stageIndex < input[routeIndex].stages.length;
      stageIndex++
    ) {
      const inputStage = inputRoute.stages[stageIndex];

      const emissionFactor = emissionFactors[inputStage.transport_form];
      const cargoWeight = inputStage.cargo_t ?? 10;

      if ("distance_km" in inputStage) {
        const emission = emissionFactor * inputStage.distance_km * cargoWeight;
        outputChain.chain_kg += emission;
        outputRoute.route_kg += emission;

        outputRoute.stages.push({
          stage_kg: Math.round(emission),
          transport_form: inputStage.transport_form,
        });
      } else {
        const from = getLocation(inputStage.from, "from");
        if ("error" in from) {
          return from;
        }

        const to = getLocation(inputStage.to, "to");
        if ("error" in to) {
          return to;
        }

        const response = await getDistance(from.location, to.location);

        if (response === "Could not connect locations") {
          return {
            status: 400,
            error: response,
            route_id: inputRoute.id,
            stage_index: stageIndex,
            from: from.address,
            to: to.address,
          };
        }

        if ("error" in response) {
          return response;
        }

        const emission = emissionFactor * response.distance_km * cargoWeight;
        outputChain.chain_kg += emission;
        outputRoute.route_kg += emission;

        outputRoute.stages.push({
          stage_kg: Math.round(emission),
          transport_form: inputStage.transport_form,
        });
      }
    }

    outputRoute.route_kg = Math.round(outputRoute.route_kg);
  }

  outputChain.chain_kg = Math.round(outputChain.chain_kg);
  return outputChain;
}

function getLocation(
  address: AddressType,
  label: FromOrToType,
): { address: AddressType, location: LocationType } | LocationErrorType & WithStatus<400> {
  const results = getWorldCities().getLocations(address);

  if (results.length === 0) {
    return {
      status: 400,
      error: "No such address",
      fromOrTo: label,
    };
  }

  if (results.length > 1) {
    return {
      status: 400,
      error: "Ambiguous address",
      fromOrTo: label,
      addresses: results.map((result) => result.address),
    };
  }

  return results[0];
}
