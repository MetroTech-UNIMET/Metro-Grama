package tools

// IndexedItem represents an item along with its original index in the source collection.
type IndexedItem[T any] struct {
	Value T
	Index int
}

// DiffResultWithIndex holds the result of comparing two collections.
// It contains items to add, items to remove, and items that exist in both,
// each wrapped in IndexedItem to preserve their original index.
type DiffResultWithIndex[T any, J any] struct {
	ToAdd    []IndexedItem[T]
	ToRemove []IndexedItem[J]
	Existing []IndexedItem[T]
}

// CalculateDiffObjectsWithIndex compares two slices of items and determines which items are new,
// which are removed, and which already exist, based on a unique ID.
//
// It returns a DiffResultWithIndex containing the categorized items with their original indices.
//
// T: The type of items in the new collection.
// J: The type of items in the current collection.
// K: The type of the unique ID (must be comparable).
//
// currentItems: The slice of existing items.
// getIdCurrent: A function to extract the unique ID from an item in currentItems.
// newItems: The slice of new items.
// getIdNew: A function to extract the unique ID from an item in newItems.
func CalculateDiffObjectsWithIndex[T any, J any, K comparable](
	currentItems []J,
	getIdCurrent func(J) K,
	newItems []T,
	getIdNew func(T) K,
) DiffResultWithIndex[T, J] {
	currentMap := make(map[K]struct{})
	for _, item := range currentItems {
		currentMap[getIdCurrent(item)] = struct{}{}
	}

	newMap := make(map[K]struct{})
	for _, item := range newItems {
		newMap[getIdNew(item)] = struct{}{}
	}

	toAdd := []IndexedItem[T]{}
	existing := []IndexedItem[T]{}
	toRemove := []IndexedItem[J]{}

	for i, item := range newItems {
		id := getIdNew(item)
		if _, found := currentMap[id]; found {
			existing = append(existing, IndexedItem[T]{Value: item, Index: i})
		} else {
			toAdd = append(toAdd, IndexedItem[T]{Value: item, Index: i})
		}
	}

	for i, item := range currentItems {
		id := getIdCurrent(item)
		if _, found := newMap[id]; !found {
			toRemove = append(toRemove, IndexedItem[J]{Value: item, Index: i})
		}
	}

	return DiffResultWithIndex[T, J]{
		ToAdd:    toAdd,
		ToRemove: toRemove,
		Existing: existing,
	}
}

// DiffResult holds the result of comparing two collections.
// It contains items to add, items to remove, and items that exist in both.
type DiffResult[T any, J any] struct {
	ToAdd    []T
	ToRemove []J
	Existing []T
}

// CalculateDiffObjects compares two slices of items and determines which items are new,
// which are removed, and which already exist, based on a unique ID.
//
// It returns a DiffResult containing the categorized items.
//
// T: The type of items in the new collection.
// J: The type of items in the current collection.
// K: The type of the unique ID (must be comparable).
//
// currentItems: The slice of existing items.
// getIdCurrent: A function to extract the unique ID from an item in currentItems.
// newItems: The slice of new items.
// getIdNew: A function to extract the unique ID from an item in newItems.
func CalculateDiffObjects[T any, J any, K comparable](
	currentItems []J,
	getIdCurrent func(J) K,
	newItems []T,
	getIdNew func(T) K,
) DiffResult[T, J] {
	currentMap := make(map[K]J)
	for _, item := range currentItems {
		currentMap[getIdCurrent(item)] = item
	}

	newMap := make(map[K]T)
	for _, item := range newItems {
		newMap[getIdNew(item)] = item
	}

	toAdd := []T{}
	existing := []T{}
	toRemove := []J{}

	for id, item := range newMap {
		if _, found := currentMap[id]; found {
			existing = append(existing, item)
		} else {
			toAdd = append(toAdd, item)
		}
	}

	for id, item := range currentMap {
		if _, found := newMap[id]; !found {
			toRemove = append(toRemove, item)
		}
	}

	return DiffResult[T, J]{
		ToAdd:    toAdd,
		ToRemove: toRemove,
		Existing: existing,
	}
}

// CalculateMatrixReplacementDiff compares a current matrix (slice of slices) with an update matrix (map of maps).
/// It identifies items to add, remove, and existing items based on positional replacement logic.
//
// If an item exists in the updateMatrix at [r][c], and an item exists in currentMatrix at [r][c],
/// the item in currentMatrix is considered for removal (replaced), and the item in updateMatrix is added.
/// If their IDs match, it is considered an update (Existing).
//
// T: The type of items in the update matrix.
// J: The type of items in the current matrix.
// K: The type of the unique ID (must be comparable).
//
// currentMatrix: The existing data as a slice of slices.
// updateMatrix: The updates as a map of maps (row index -> col index -> item).
// getIdCurrent: Function to get ID from J.
// getIdNew: Function to get ID from T.
// isCurrentNil: Function to check if an item in currentMatrix is nil/empty.
func CalculateMatrixReplacementDiff[T any, J any, K comparable](
	currentMatrix [][]J,
	updateMatrix map[int]map[int]T,
	getIdCurrent func(J) K,
	getIdNew func(T) K,
	isCurrentNil func(J) bool,
) DiffResult[T, J] {
	toAdd := []T{}
	toRemove := []J{}
	existing := []T{}

	for r, row := range updateMatrix {
		for c, newItem := range row {
			var oldItem J
			var hasOld bool

			if r >= 0 && r < len(currentMatrix) {
				if c >= 0 && c < len(currentMatrix[r]) {
					oldItem = currentMatrix[r][c]
					if !isCurrentNil(oldItem) {
						hasOld = true
					}
				}
			}

			if hasOld {
				idNew := getIdNew(newItem)
				idOld := getIdCurrent(oldItem)
				if idNew == idOld {
					existing = append(existing, newItem)
				} else {
					toAdd = append(toAdd, newItem)
					toRemove = append(toRemove, oldItem)
				}
			} else {
				toAdd = append(toAdd, newItem)
			}
		}
	}

	return DiffResult[T, J]{
		ToAdd:    toAdd,
		ToRemove: toRemove,
		Existing: existing,
	}
}
