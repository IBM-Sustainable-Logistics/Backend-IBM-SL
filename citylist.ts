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

type CityQuery = { city: string; country?: string };
type CitySuggestion = { city: string; country: string };
type CityData = {
  lat: number;
  lon: number;
  country: string;
  population: number;
  id: number;
};
type CityEntry = { city: string; data: CityData };

export default class CityList {
  private trie: TrieNode;

  public constructor() {
    this.trie = { children: [], datas: undefined };
  }

  public getAutoSuggestions(query: CityQuery): CitySuggestion[] {
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

  public getLocations(
    query: CityQuery,
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

  public insert(city: string, data: CityData): void {
    node_insert(this.trie, city, data);
  }
}

type TrieNode = {
  children: { char: string; node: TrieNode }[];

  /**
   * Contains data if the current node is a valid city.
   * Otherwise, it is undefined.
   */
  datas: undefined | CityData[];
};

function node_insert(node: TrieNode, city: string, data: CityData): void {
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

function node_get_all_from(
  node: TrieNode,
  compare?: (a: CityData, b: CityData) => number,
  predicate?: (entry: CityEntry) => boolean,
  limit?: number,
  city?: string,
  array?: CityEntry[],
): CityEntry[] {
  if (city === undefined) {
    city = "";
  }

  if (array === undefined) {
    array = [];
  }

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
