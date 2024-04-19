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

        if (array.some((o) => e.data.id === o.data.id)) {
          return false;
        }

        return true;
      },
      10,
      query.city,
      array,
    );

    return array.map((e) => ({
      city: e.city,
      country: e.data.country,
    }));
  }

  public getAutoSuggestionsFuzzy(query: Query): Suggestion[] {
    const queryCountry = query.country;

    const nodes = node_get_fuzzy(this.trie, query.city, query.city.length / 4 + 1);
    if (nodes.length === 0) {
      return [];
    }

    let array: CityEntry[] = [];
    for (const entry of nodes) {
      node_get_all_from(
        entry.node,
        undefined,
        (e) => {
          if (queryCountry !== undefined && !e.data.country.startsWith(queryCountry)) {
             return false;
          }

          if (array.some((o) => e.data.id === o.data.id)) {
            return false;
          }

          return true;
        },
        100,
        entry.city,
        array,
      );
    }

    array = [...new Set(array)];

    return array.map((e) => ({
      city: e.city,
      country: e.data.country,
    }))
    .slice(0, 10);
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

function node_get(node: TrieNode, query: string): undefined | TrieNode {
  if (query.length === 0) {
    return node;
  }

  const char = query[0];

  for (const child of node.children) {
    if (child.char == char) {
      return node_get(child.node, query.slice(1));
    }
  }

  return undefined;
}

type FuzzyEntry = {
  node: TrieNode,
  city: string,
  score: number,
};

function node_get_fuzzy(node: TrieNode, query: string, incorrects_left: number, city = "", array: FuzzyEntry[] = [], extra = false): FuzzyEntry[] {
  if (query.length === 0) {
    array.push({
      node: node,
      city: city,
      score: -incorrects_left,
    });
    return array;
  }

  const next_char = query[0].toLowerCase();

  for (const child of node.children) {
    const child_char = child.char.toLowerCase();

    // If correct
    if (child_char == next_char) {
      node_get_fuzzy(child.node, query.slice(1), incorrects_left, city + child.char, array);
    }

    if (incorrects_left <= 0) {
      continue;
    }

    // Assume user typed an extra character
    if (!extra) {
      node_get_fuzzy(node, query.slice(1), incorrects_left - 1, city, array, true);
    }

    // Assume user typed incorrect character
    node_get_fuzzy(child.node, query.slice(1), incorrects_left - 1, city + child.char, array);

    // Assume user skipped a character
    node_get_fuzzy(child.node, query, incorrects_left - 1, city + child.char, array);
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
