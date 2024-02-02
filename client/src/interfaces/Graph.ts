interface Node4j<T> {
  Id: string;
  Data: T;
}

interface Edge {
  From: string;
  To: string;
}

interface Graph<T> {
  Nodes: Node4j<T>[];
  Edges: Edge[];
}