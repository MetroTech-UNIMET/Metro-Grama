export interface Node4j<T> {
  id: string;
  data: T;
}

interface Edge {
  from: string;
  to: string;
}

interface Graph<T> {
  nodes: Node4j<T>[];
  edges: Edge[];
}