import { AddressType } from "./components/schemas/AddressSchema.ts";
import { SuggestionsType } from "./components/schemas/SuggestionsSchema.ts";
import { ErrorType } from "./components/schemas/ErrorSchema.ts";
import { getWorldCities } from "./citylist.ts";

export function suggestCities(input: AddressType): SuggestionsType | ErrorType {
  return getWorldCities().getAutoSuggestions(input);
}
