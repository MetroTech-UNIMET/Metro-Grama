export interface Node4j<T> {
  id: string;
  data: T;
}

export interface Edge {
  from: string;
  to: string;
}

export interface Graph<T> {
  nodes: Node4j<T>[];
  edges: Edge[];
}