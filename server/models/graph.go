package models

type Node[T any] struct {
	ID   string `json:"id"`
	Data T      `json:"data"`
}

type Edge struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type Graph[T any] struct {
	Nodes []Node[T] `json:"nodes"`
	Edges []Edge    `json:"edges"`
}
