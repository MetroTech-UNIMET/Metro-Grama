import { AxiosError } from "axios";

//FIXME - Mejorar el tipado del error
export function notRetryOnUnauthorized<T>(
  failureCount: number,
  error: AxiosError<T>,
  maxRetries = 3
) {
  // Don't retry if the error message is "Unauthorized"
  if ((error as any)?.response?.data?.message === "Unauthorized") {
    return false;
  }

  return failureCount < maxRetries;
}

export function idToSurrealId(id: string, table: string) {
  return `${table}:${id}`;
}

export function surrealIdToId(surrealId: string) {
  return surrealId.split(":")[1];
}