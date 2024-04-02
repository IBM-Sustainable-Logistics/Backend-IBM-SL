
import { ErrorType } from "./components/schemas/EstimateErrorSchema.ts";
import { InputType, TransportForm } from "./components/schemas/EstimateInputSchema.ts";
import { OutputType } from "./components/schemas/EstimateOutputSchema.ts";
import { getDistance } from "./bingmaps.ts";

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

export async function estimateEmissions(input: InputType): Promise<OutputType | ErrorType> {
  let total_kg = 0;

  const stages: number[] = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const stage = input[i];

    const emissionFactor = emissionFactors[stage.transport_form];
    const cargoWeight = 10;

    if ("distance_km" in stage) {
      const emission = emissionFactor * stage.distance_km * cargoWeight;
      total_kg += emission;

      stages[i] = Math.round(emission);
    } else {
      const response = await getDistance(stage.from, stage.to);

      if ("status" in response) {
        return response;
      }

      const emission = emissionFactor * response.distance_km * cargoWeight;
      total_kg += emission;

      stages[i] = Math.round(emission);
    }
  }

  return {
    status: 200,
    total_kg: Math.round(total_kg),
    stages: stages,
  };
}

