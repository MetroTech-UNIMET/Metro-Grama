import type { UndefinedInitialDataOptions } from '@tanstack/react-query';

export type OptionalQueryOptions<T> = Omit<UndefinedInitialDataOptions<T>, 'queryKey' | 'queryFn'>;
