import type { DefaultError, UndefinedInitialDataOptions } from '@tanstack/react-query';

export type OptionalQueryOptions<T, Error = DefaultError> = Omit<
  UndefinedInitialDataOptions<T, Error>,
  'queryKey' | 'queryFn'
>;
