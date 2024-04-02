
import { ErrorType } from "./components/schemas/SuggestErrorSchema.ts";
import { InputType } from "./components/schemas/SuggestInputSchema.ts";
import { OutputType } from "./components/schemas/SuggestOutputSchema.ts";
import CityList from "./citylist.ts";
import { addWorldCities } from "./addworldcities.ts";

let city_list: CityList | undefined = undefined;

export function suggestCities(input: InputType): OutputType | ErrorType {
  if (city_list === undefined) {
    city_list = new CityList();
    addWorldCities(city_list);
  }

  return city_list.getAutoSuggestions(input);
}

