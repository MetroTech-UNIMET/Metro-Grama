package tools

import (
	"context"
	"sync"
)

func Parallel[T any](items []T) func(func(int, T) bool) {
	return func(yield func(int, T) bool) {
		var wg sync.WaitGroup
		wg.Add(len(items))

		for i, item := range items {
			go func() {
				defer wg.Done()
				yield(i, item)
			}()
		}

		wg.Wait()
	}
}

func CancellableParallel[T any](items []T) func(func(int, T) bool) {
	return func(yield func(int, T) bool) {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		var wg sync.WaitGroup
		wg.Add(len(items))

		for i, item := range items {
			go func() {
				defer wg.Done()

				select {
				case <-ctx.Done():
					return
				default:
					if !yield(i, item) {
						cancel()
					}
				}

				yield(i, item)
			}()
		}

		wg.Wait()
	}
}
