import { getNotifications, NotificationDTO } from '@/api/notificationsApi';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

import type { AxiosError } from 'axios';
import { OptionalQueryOptions } from '../types';

interface Props<T = NotificationDTO> {
  queryOptions?: OptionalQueryOptions<T, AxiosError>;
}

export function fetchNotificationsOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: queryKeys.notifications.all.queryKey,
    queryFn: getNotifications,
    ...queryOpt,
  });
}

export function useFetchNotifications(props?: Props) {
  return useQuery(fetchNotificationsOptions(props));
}
