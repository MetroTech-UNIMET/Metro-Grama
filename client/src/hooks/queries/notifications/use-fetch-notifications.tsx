import { getNotifications, NotificationDTO } from '@/api/notificationsApi';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { AxiosError } from 'axios';
import { OptionalQueryOptions } from '../types';

interface Props<T = NotificationDTO> {
  queryOptions?: OptionalQueryOptions<T, AxiosError>;
}

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function fetchNotificationsOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
    ...queryOpt,
  });
}

export function useFetchNotifications(props?: Props) {
  return useQuery(fetchNotificationsOptions(props));
}
