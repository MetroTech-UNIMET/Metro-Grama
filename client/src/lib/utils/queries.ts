import type { AxiosError } from 'axios';
import type { Id } from '@/interfaces/surrealDb';

//FIXME - Mejorar el tipado del error
export function notRetryOnUnauthorized<T>(failureCount: number, error: AxiosError<T>, maxRetries = 3) {
  // Don't retry if the error message is "Unauthorized"
  if ((error as any)?.response?.data?.message === 'Unauthorized') {
    return false;
  }

  return failureCount < maxRetries;
}

export function idToSurrealId(id: string, table: string) {
  return `${table}:${id}`;
}

export function surrealIdToId(surrealId: Id) {
  return idToSurrealId(surrealId.Table, surrealId.ID);
}

export function createSurrealId<Table, X>(table: Table, id: X): Id<Table, X> {
  return {
    Table: table,
    ID: id,
  };
}
