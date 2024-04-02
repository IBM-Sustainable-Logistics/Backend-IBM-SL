/*
CSV format

  Name:
    The city names are both stored with Unicode characters, `city`, and Ascii, `city_ascii`.

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

  public getAutoSuggestions(query: string): { city: string, country: string }[] {
    return [
      { city: "City1", country: "Country1" },
      { city: "City2", country: "Country2" },
      { city: "City3", country: "Country3" },
    ];
  }

  public getLocation(
    query: string,
  ): null | { lat: number; lon: number; city: string } {
    return null;
  }

  public insert(city: string, data: { lat: number, lon: number, country: string }): void {
    node_insert(this.city_trie, city, data);
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

function node_insert<Data>(node: TrieNode<Data>, word: string, data: Data): void {
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
      node_insert(child.node, word.slice(1), data);
      return;
    }
  }

  const new_node: TrieNode<Data> = { children: [], data: undefined };

  node.children.push({ char, node: new_node });

  node_insert(new_node, word.slice(1), data);
}

function node_get<Data>(node: TrieNode<Data>, word: string): undefined | Data[] {
  if (word.length === 0)
    return node.data;

  const char = word[0];

  for (const child of node.children) {
    if (child.char == char) {
      return node_get(child.node, word.slice(1));
    }
  }

  return undefined;
}
