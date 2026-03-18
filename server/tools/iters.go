package tools

import (
	"context"
	"sync"
)

func Parallel[T any](items []T) func(func(int, T) bool) {
	return func(yield func(int, T) bool) {
		type indexed struct {
			i    int
			item T
		}
		ch := make(chan indexed, len(items))
		var wg sync.WaitGroup
		wg.Add(len(items))
		for i, item := range items {
			go func(i int, item T) {
				defer wg.Done()
				ch <- indexed{i, item}
			}(i, item)
		}
		go func() {
			wg.Wait()
			close(ch)
		}()
		for v := range ch {
			if !yield(v.i, v.item) {
				return
			}
		}
	}
}

func CancellableParallel[T any](items []T) func(func(int, T) bool) {
	return func(yield func(int, T) bool) {
		type indexed struct {
			i    int
			item T
		}
		ch := make(chan indexed, len(items))
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		var wg sync.WaitGroup
		wg.Add(len(items))
		for i, item := range items {
			go func(i int, item T) {
				defer wg.Done()
				select {
				case <-ctx.Done():
					return
				case ch <- indexed{i, item}:
				}
			}(i, item)
		}
		go func() {
			wg.Wait()
			close(ch)
		}()
		for v := range ch {
			if !yield(v.i, v.item) {
				cancel()
				return
			}
		}
	}
}
