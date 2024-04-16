import { AddressType } from "./components/schemas/AddressSchema.ts";
import { SuggestionsType } from "./components/schemas/SuggestionsSchema.ts";
import { ErrorType, WithStatus } from "./components/schemas/ErrorSchema.ts";
import { getWorldCities } from "./citylist.ts";

export function suggestCities(input: AddressType): SuggestionsType | ErrorType & WithStatus {
  return getWorldCities().getAutoSuggestions(input);
}

export function suggestCitiesFuzzy(input: AddressType): SuggestionsType | ErrorType & WithStatus {
  return getWorldCities().getAutoSuggestionsFuzzy(input);
}
