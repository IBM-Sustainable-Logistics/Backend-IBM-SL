import { LocationType } from "./components/schemas/LocationSchema.ts";
import { addWorldCities } from "./worldcities.ts";
import { addDanishCities } from "./danishcities.ts";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
const segmenter = new Intl.Segmenter();

let world_cities: CityList | undefined = undefined;

export function getWorldCities(): CityList {
  if (world_cities === undefined) {
    world_cities = new CityList();
    addWorldCities(world_cities);
    addDanishCities(world_cities);
  }
  return world_cities;
}

type Query = { city: string; country?: string };
type Suggestion = { city: string; country: string };
type Data = {
  id: number;
  city: string;
  country: string;
  population: number;
  lat: number;
  lon: number;
};
type CityEntry = { city: string; data: Data };

export default class CityList {
  private trie: TrieNode;

  public constructor() {
    this.trie = { children: [], leaf: undefined };
  }

  public getAutoSuggestions(query: Query): Suggestion[] {
    const queryCountry = query.country;

    const querySegments = [...segmenter.segment(query.city)];

    const node = node_get(this.trie, querySegments);

    if (node === undefined) {
      return [];
    }

    const entries: CityEntry[] = [];
    node_get_all_from(
      node,
      (a, b) => a.population - b.population,
      (data) => {
        if (queryCountry !== undefined && !data.country.startsWith(queryCountry)) {
          return false;
        }

        if (entries.some((other) => data.city === other.city && data.country === other.data.country)) {
          return false;
        }

        return true;
      },
      10,
      entries,
    );

    return entries.map((e) => ({
      city: e.city,
      country: e.data.country,
    }));
  }

  public getAutoSuggestionsFuzzy(query: Query): Suggestion[] {
    const queryCountry = query.country;

    const querySegments = [...segmenter.segment(query.city)];

    const nodes: FuzzyEntry[] = [];
    node_get_fuzzy(this.trie, querySegments, 1 + query.city.length / 4, nodes);

    if (nodes.length === 0) {
      return [];
    }

    nodes.sort((a, b) => b.score - a.score);

    let entries: CityEntry[] = [];
    for (const entry of nodes) {
      node_get_all_from(
        entry.node,
        (a, b) => a.population - b.population,
        (data) => {
          if (queryCountry !== undefined && !data.country.startsWith(queryCountry)) {
             return false;
          }

          if (entries.some((other) => data.city === other.city && data.country === other.data.country)) {
            return false;
          }

          return true;
        },
        50,
        entries,
      );
    }

    entries = [...new Set(entries)];

    return entries.map((e) => ({
      city: e.city,
      country: e.data.country,
    }))
    .slice(0, 10);
  }

  public getLocations(
    query: Query,
  ): LocationType[] {
    const querySegments = [...segmenter.segment(query.city)];

    const node = node_get(this.trie, querySegments);

    if (node?.leaf === undefined) {
      return [];
    }

    const country = query.country;
    let datas = country !== undefined
      ? node.leaf.datas.filter((d) => d.country.startsWith(country))
      : node.leaf.datas;

    datas = datas.toSorted((a, b) => a.population - b.population);
    
    const array: typeof datas = [];
    for (const data of datas) {
      if (array.some((o) => data.country === o.country))
        continue;
      array.push(data);
    }

    return array.map((d) => ({ lat: d.lat, lon: d.lon }));
  }

  public insert(city: string, data: { lat: number; lon: number; country: string, population: number, id: number }): void {
    const segments = [...segmenter.segment(city)];

    node_insert(this.trie, city, segments, { ...data, city: city });
  }
}

type TrieLeaf = {
  city: string;
  datas: Data[];
};

type TrieNode = {
  children: { segment: string; lowercase: string; node: TrieNode }[];

  /**
   * Contains data if the current node is a valid city.
   * Otherwise, it is undefined.
   */
  leaf: undefined | TrieLeaf;
};

function node_insert(node: TrieNode, city: string, segments: Intl.SegmentData[], data: Data): void {
  if (segments.length >= 1) {
    const segment = segments[0].segment;

    for (const child of node.children) {
      if (child.segment === segment) {
        node_insert(child.node, city, segments.slice(1), data);
        return;
      }
    }

    const new_node: TrieNode = { children: [], leaf: undefined };
    node.children.push({ segment: segment, lowercase: segment.toLowerCase(), node: new_node });
    node_insert(new_node, city, segments.slice(1), data);

    return;
  }

  if (node.leaf === undefined) {
    node.leaf = { city: city, datas: [data] };
  }
  else {
    node.leaf.datas.push(data);
  }
}

function node_get(node: TrieNode, segments: Intl.SegmentData[]): undefined | TrieNode {
  if (segments.length === 0) {
    return node;
  }

  const lowercase = segments[0].segment.toLowerCase();

  for (const child of node.children) {
    if (child.lowercase === lowercase) {
      return node_get(child.node, segments.slice(1));
    }
  }

  return undefined;
}

type FuzzyEntry = {
  node: TrieNode,
  score: number,
};

function node_get_fuzzy(node: TrieNode, segments: Intl.SegmentData[], incorrects_left: number, array: FuzzyEntry[], /*extra = false*/): void {
  if (segments.length === 0) {
    array.push({
      node: node,
      score: incorrects_left,
    });
    return;
  }

  const lowercase = segments[0].segment.toLowerCase();

  for (const child of node.children) {
    // If correct
    if (child.lowercase === lowercase) {
      node_get_fuzzy(child.node, segments.slice(1), incorrects_left, array);
    }

    if (incorrects_left <= 0) {
      continue;
    }

    // Assume user typed an extra character (This is slow)
    // if (!extra) {
    //   node_get_fuzzy(node, segments.slice(1), incorrects_left - 1, array, true);
    // }

    // Assume user typed incorrect character
    node_get_fuzzy(child.node, segments.slice(1), incorrects_left - 1, array);

    // Assume user skipped a character
    node_get_fuzzy(child.node, segments, incorrects_left - 1, array);
  }
}

function node_get_all_from(
  node: TrieNode,
  compare?: (a: Data, b: Data) => number,
  predicate?: (data: Data) => boolean,
  limit?: number,
  array: CityEntry[] = [],
): void {
  if (limit !== undefined && array.length >= limit) {
    return;
  }

  if (node.leaf !== undefined) {
    const datas = node.leaf.datas;
    // const datas = compare !== undefined
    //   ? node.leaf.datas.toSorted(compare)
    //   : node.leaf.datas;

    for (let i = 0; i < datas.length && (limit === undefined || array.length < limit); i++) {
      const data = node.leaf.datas[i];

      if (predicate !== undefined && predicate(data)) {
        array.push({ city: node.leaf.city, data: data });
      }
    }
  }

  for (const child of node.children) {
    node_get_all_from(
      child.node,
      compare,
      predicate,
      limit,
      array,
    );
  }
}
