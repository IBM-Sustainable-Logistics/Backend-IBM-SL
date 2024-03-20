/*
CSV format

  Name:
    The city names are both stored with Unicode characters, `city`, and Ascii, `city_ascii`.
    Each city might also have an `city_alt` that contains an alternative name/spelling for
    the city.

  Coordinates:
    The columns: `lat` and `lng` respectively contains the latitude and longitude,

  Country:
    The `country` is the country where the city is located.

 */

export default class CityList {
  private city_trie: TrieNode<{ lat: number, lon: number, country: string }>;

  public constructor() {
    this.city_trie = { children: [], data: undefined };
  }

  public getAutoSuggestions(query: string): string[] {
    return [];
  }

  public getLocation(
    query: string,
  ): null | { lat: number; lon: number; city: string } {
    return null;
  }
}

type TrieNode<Data> = {
  children: { char: string, node: TrieNode<Data> }[],

  /**
   * Contains data if the current node is a valid word.
   * Otherwise, it is undefined.
   */
  data: undefined | Data[];
};

function insert<Data>(node: TrieNode<Data>, word: string, data: Data): void {
  if (word.length === 0) {
    if (node.data === undefined)
      node.data = [data];
    else
      node.data.push(data);

    return;
  }

  const char = word[0];

  for (const child of node.children) {
    if (child.char == char) {
      insert(child.node, word.slice(1), data);
      return;
    }
  }

  const new_node: TrieNode<Data> = { children: [], data: undefined };

  node.children.push({ char, node: new_node });

  insert(new_node, word.slice(1), data);
}

function get<Data>(node: TrieNode<Data>, word: string): undefined | Data[] {
  if (word.length === 0)
    return node.data;

  const char = word[0];

  for (const child of node.children) {
    if (child.char == char) {
      return get(child.node, word.slice(1));
    }
  }

  return undefined;
}

