package models

type Node[T any] struct {
	Id   string
	Data T
}

type Edge struct {
	From string
	To   string
}

type Graph[T any] struct {
	Nodes []Node[T]
	Edges []Edge
}
