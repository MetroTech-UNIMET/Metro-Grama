export function forEachPromiseAll<T, J>(
  iterable: T[],
  callback: (item: T, index: number) => Promise<J>
) {
  return Promise.all(iterable.map(callback));
}