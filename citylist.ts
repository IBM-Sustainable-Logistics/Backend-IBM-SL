/*
CSV format

  Name:
    The city names are both stored with Unicode characters, `city`, and Ascii, `city_ascii`.

  Coordinates:
    The columns: `lat` and `lng` respectively contains the latitude and longitude,

  Country:
    The `country` is the country where the city is located.

 */

type CityQuery = { city_start: string, country?: string };
type CitySuggestion = { city: string, country: string };
type CityData = { lat: number, lon: number, country: string, population: number, id: number };
type CityEntry = { city_end: string, data: CityData };

export default class CityList {
  private trie: TrieNode;

  public constructor() {
    this.trie = { children: [], datas: undefined };
  }

  public getAutoSuggestions(query: CityQuery): CitySuggestion[] {
    const queryCountry = query.country;

    const node = node_get(this.trie, query.city_start);
    if (node === undefined)
      return [];

    const array: CityEntry[] = [];
    node_get_all_from(
      node,
      (a, b) => a.population - b.population,
      (e) => {
        if (queryCountry !== undefined && !e.data.country.startsWith(queryCountry))
          return false;

        if (array.find(o => e.city_end === o.city_end && e.data.country === o.data.country) !== undefined)
          return false;

        return true;
      },
      10,
      "",
      array,
    );

    return array.map(e => ({ city: query.city_start + e.city_end, country: e.data.country }));
  }

  // public getLocation(
  //   query: string,
  // ): null | { lat: number; lon: number; } {
  //   return null;
  // }

  public insert(city: string, data: CityData): void {
    node_insert(this.trie, city, data);
  }
}

type TrieNode = {
  children: { char: string, node: TrieNode }[],

  /**
   * Contains data if the current node is a valid city.
   * Otherwise, it is undefined.
   */
  datas: undefined | CityData[];
};

function node_insert(node: TrieNode, city_end: string, data: CityData): void {
  if (city_end.length > 0) {
    const char = city_end.charAt(0);

    for (const child of node.children) {
      if (child.char == char) {
        node_insert(child.node, city_end.slice(1), data);
        return;
      }
    }

    const new_node: TrieNode = { children: [], datas: undefined };
    node.children.push({ char, node: new_node });
    node_insert(new_node, city_end.slice(1), data);

    return;
  }

  if (node.datas === undefined) {
    node.datas = [data];
    return;
  }

  node.datas.push(data);
  return;
}

function node_get(node: TrieNode, city_end: string): undefined | TrieNode {
  if (city_end.length === 0)
    return node;

  const char = city_end[0];

  for (const child of node.children) {
    if (child.char == char) {
      return node_get(child.node, city_end.slice(1));
    }
  }

  return undefined;
}

function node_get_all_from(node: TrieNode, compare?: (a: CityData, b: CityData) => number, predicate?: (entry: CityEntry) => boolean, limit?: number, city_end?: string, array?: CityEntry[]): CityEntry[] {
  if (city_end === undefined)
    city_end = "";

  if (array === undefined)
    array = [];

  if (limit !== undefined && array.length >= limit)
    return array;

  if (node.datas !== undefined) {
    const datas = compare !== undefined ? node.datas.toSorted(compare) : node.datas;
    for (let i = 0; i < datas.length && (limit === undefined || array.length < limit); i++) {
      if (predicate !== undefined && predicate({ city_end: city_end, data: datas[i] })) {
        array.push({ city_end: city_end, data: datas[i] });
      }
    }
  }

  for (const child of node.children) {
    node_get_all_from(child.node, compare, predicate, limit, city_end + child.char, array);
  }

  return array;
}
