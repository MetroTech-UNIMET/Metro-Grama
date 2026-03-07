import { getUserProfile } from '@/api/usersApi';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { notRetryOnUnauthorized } from '@utils/queries';

import type { AxiosError } from 'axios';
import type { AdminUser, StudentUser, User } from '@/interfaces/User';
import type { OptionalQueryOptions } from '../types';

export type UserType = StudentUser | AdminUser | User;

interface Props<T = UserType | null> {
  queryOptions?: OptionalQueryOptions<T, AxiosError>;
}

export function fetchStudentMyUserOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['users', 'profile'],
    queryFn: getUserProfile,
    retry: notRetryOnUnauthorized,
    ...queryOpt,
  });
}
export function useFetchMyUser(props?: Props) {
  return useQuery(fetchStudentMyUserOptions(props));
}
