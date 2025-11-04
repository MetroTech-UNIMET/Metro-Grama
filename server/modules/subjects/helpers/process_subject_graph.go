package helpers

import (
	"metrograma/models"
)

// ProcessSubjectGraph is a generic graph builder.
// - T is the node payload type.
// - I is the input item type (from a query, DTO, etc.).
// Callers provide mapping functions to produce a Node[T] and its Edges.
func ProcessSubjectGraph[T any, I any](items []I, toNode func(I) models.Node[T], toEdges func(I) []models.Edge) models.Graph[T] {
	nodes := make([]models.Node[T], len(items))
	edges := make([]models.Edge, 0)

	for i, it := range items {
		nodes[i] = toNode(it)
		if toEdges != nil {
			e := toEdges(it)
			if len(e) > 0 {
				edges = append(edges, e...)
			}
		}
	}

	return models.Graph[T]{
		Nodes: nodes,
		Edges: edges,
	}
}
