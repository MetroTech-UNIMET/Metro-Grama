export function eatErrors(fn: () => void) {
  try {
    return fn();
  } catch (error) {
    // Do nothing
  }
}

export async function eatErrorsAsync(fn: () => Promise<void>) {
  try {
    return await fn();
  } catch (error) {
    // Do nothing
  }
}