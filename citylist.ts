import { LocationType } from "./components/schemas/LocationSchema.ts";
import { addWorldCities } from "./worldcities.ts";

let world_cities: CityList | undefined = undefined;

export function getWorldCities(): CityList {
  if (world_cities === undefined) {
    world_cities = new CityList();
    addWorldCities(world_cities);
  }
  return world_cities;
}

/*
CSV format

  Name:
    The city names are both stored with Unicode characters, `city`, and Ascii, `city_ascii`.

  Coordinates:
    The columns: `lat` and `lng` respectively contains the latitude and longitude,

  Country:
    The `country` is the country where the city is located.

 */

type Query = { city: string; country?: string };
type Suggestion = { city: string; country: string };
type Data = {
  lat: number;
  lon: number;
  country: string;
  population: number;
  id: number;
};
type CityEntry = { city: string; data: Data };

export default class CityList {
  private trie: TrieNode;

  public constructor() {
    this.trie = { children: [], datas: undefined };
  }

  public getAutoSuggestions(query: Query): Suggestion[] {
    const queryCountry = query.country;

    const node = node_get(this.trie, query.city);
    if (node === undefined) {
      return [];
    }

    const array: CityEntry[] = [];
    node_get_all_from(
      node,
      (a, b) => a.population - b.population,
      (e) => {
        if (queryCountry !== undefined && !e.data.country.startsWith(queryCountry)) {
          return false;
        }

        if (array.some((o) => e.city === o.city && e.data.country === o.data.country)) {
          return false;
        }

        return true;
      },
      10,
      "",
      array,
    );

    return array.map((e) => ({
      city: query.city + e.city,
      country: e.data.country,
    }));
  }

  public getAutoSuggestionsFuzzy(query: Query): Suggestion[] {
    const _queryCountry = query.country;

    const nodes = node_get_fuzzy(this.trie, query.city, 1);
    if (nodes.length === 0) {
      return [];
    }

    const array: CityEntry[] = [];
    for (const node of nodes) {
      node_get_all_from(
        node.node,
        undefined,
        (_e) => {
          // if (queryCountry !== undefined && !e.data.country.startsWith(queryCountry)) {
          //   return false;
          // }

          // if (array.some((o) => e.city === o.city && e.data.country === o.data.country)) {
          //   return false;
          // }

          return true;
        },
        undefined,
        "",
        array,
      );
    }

    return array.map((e) => ({
      city: query.city + e.city,
      country: e.data.country,
    }));
  }

  public getLocations(
    query: Query,
  ): LocationType[] {
    const node = node_get(this.trie, query.city);

    if (node?.datas === undefined) {
      return [];
    }

    const country = query.country;
    let datas = country !== undefined
      ? node.datas.filter((d) => d.country.startsWith(country))
      : node.datas;

    datas = datas.toSorted((a, b) => a.population - b.population);
    
    const array: typeof datas = [];
    for (const data of datas) {
      if (array.some((o) => data.country === o.country))
        continue;
      array.push(data);
    }

    return array.map((d) => ({ lat: d.lat, lon: d.lon }));
  }

  public insert(city: string, data: Data): void {
    node_insert(this.trie, city, data);
  }
}

type TrieNode = {
  children: { char: string; node: TrieNode }[];

  /**
   * Contains data if the current node is a valid city.
   * Otherwise, it is undefined.
   */
  datas: undefined | Data[];
};

function node_insert(node: TrieNode, city: string, data: Data): void {
  if (city.length > 0) {
    const char = city.charAt(0);

    for (const child of node.children) {
      if (child.char == char) {
        node_insert(child.node, city.slice(1), data);
        return;
      }
    }

    const new_node: TrieNode = { children: [], datas: undefined };
    node.children.push({ char, node: new_node });
    node_insert(new_node, city.slice(1), data);

    return;
  }

  if (node.datas === undefined) {
    node.datas = [data];
    return;
  }

  node.datas.push(data);
  return;
}

function node_get(node: TrieNode, city: string): undefined | TrieNode {
  if (city.length === 0) {
    return node;
  }

  const char = city[0];

  for (const child of node.children) {
    if (child.char == char) {
      return node_get(child.node, city.slice(1));
    }
  }

  return undefined;
}

type FuzzyQuery = {
  char: string;
  correct: boolean;
}[];

type FuzzyEntry = {
  node: TrieNode,
  query: FuzzyQuery,
  score: number,
};

function node_get_fuzzy(node: TrieNode, city: string, incorrects_left: number, query: FuzzyQuery = [], array: FuzzyEntry[] = []): FuzzyEntry[] {
  if (city.length === 0) {
    array.push({
      node: node,
      query: query,
      score: -incorrects_left,
    });
  }

  const next_char = city[0];

  for (const child of node.children) {
    // If correct
    if (child.char == next_char) {
      const new_query = query.concat({
          char: next_char,
          correct: true,
      });

      return node_get_fuzzy(child.node, city.slice(1), incorrects_left, new_query, array);
    }

    if (incorrects_left <= 0) {
      continue;
    }

    // Assume user typed an extra character
    {
      const new_query = query.concat({
        char: next_char,
        correct: false,
      });

      node_get_fuzzy(child.node, city, incorrects_left - 1, new_query, array);
    }

    // Assume user typed incorrect character
    {
      const new_query = query.concat({
        char: child.char,
        correct: false,
      });

      node_get_fuzzy(child.node, city.slice(1), incorrects_left - 1, new_query, array);
    }

    // Assume user skipped a character
    {
      node_get_fuzzy(child.node, city.slice(1), incorrects_left - 1, query, array);
    }
  }

  return array;
}

function node_get_all_from(
  node: TrieNode,
  compare?: (a: Data, b: Data) => number,
  predicate?: (entry: CityEntry) => boolean,
  limit?: number,
  city = "",
  array: CityEntry[] = [],
): CityEntry[] {
  if (limit !== undefined && array.length >= limit) {
    return array;
  }

  if (node.datas !== undefined) {
    const datas = compare !== undefined
      ? node.datas.toSorted(compare)
      : node.datas;

    for (let i = 0; i < datas.length && (limit === undefined || array.length < limit); i++) {
      if (predicate !== undefined && predicate({ city: city, data: datas[i] })) {
        array.push({ city: city, data: datas[i] });
      }
    }
  }

  for (const child of node.children) {
    node_get_all_from(
      child.node,
      compare,
      predicate,
      limit,
      city + child.char,
      array,
    );
  }

  return array;
}
