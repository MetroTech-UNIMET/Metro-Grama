export function eatErrors(fn: () => void) {
  try {
    return fn();
  } catch (error) {
    // Do nothing
  }
}

export async function eatErrorsAsync<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (error) {
    // Do nothing
  }
}