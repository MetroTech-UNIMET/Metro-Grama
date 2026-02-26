import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { NOTIFICATIONS_QUERY_KEY } from '@/hooks/queries/notifications/use-fetch-notifications';
import { useWebsocket } from '@/hooks/use-websocket';

import { surrealIdToId } from '@utils/queries';

import type { NotificationDTO } from '@/api/notificationsApi';
import type { Notification } from '@/interfaces/Notifications';

const EVENTS = {
  BULK: 'notifications:bulk',
  NEW: 'notifications:new',
  UPDATED: 'notifications:updated',
  MARK_READ: 'notifications:markRead',
  CONNECTION_ERROR: 'connection:error',
} as const;

export function useNotificationWebsocket() {
  const queryClient = useQueryClient();

  const { emit } = useWebsocket({
    namespace: 'notifications/ws',
    onConnect: () => {
      // console.log('yeees');
    },
    onEvents: {
      [EVENTS.BULK]: (payload: NotificationDTO) => {
        if (!payload || !Array.isArray(payload.all)) return;
        queryClient.setQueryData<NotificationDTO>(NOTIFICATIONS_QUERY_KEY, payload);
      },
      [EVENTS.NEW]: (payload: Notification) => {
        if (!payload) return;
        queryClient.setQueryData<NotificationDTO>(NOTIFICATIONS_QUERY_KEY, (old) => {
          const base: NotificationDTO = old ?? { all: [], unread: [] };
          const key = surrealIdToId(payload.id);

          const dedupedAll = [payload, ...base.all.filter((item) => surrealIdToId(item.id) !== key)];
          const updatedUnread = payload.read
            ? base.unread.filter((item) => surrealIdToId(item.id) !== key)
            : [payload, ...base.unread.filter((item) => surrealIdToId(item.id) !== key)];

          return {
            all: dedupedAll,
            unread: updatedUnread,
          };
        });
      },
      [EVENTS.UPDATED]: (payload: Notification[]) => {
        if (!Array.isArray(payload) || payload.length === 0) return;

        const updateMap = new Map(payload.map((item) => [surrealIdToId(item.id), item]));

        queryClient.setQueryData<NotificationDTO>(NOTIFICATIONS_QUERY_KEY, (old) => {
          if (!old) return old;

          const all = old.all.map((item) => updateMap.get(surrealIdToId(item.id)) ?? item);
          const unread = all.filter((item) => !item.read);

          return {
            all,
            unread,
          };
        });
      },
      [EVENTS.CONNECTION_ERROR]: (payload: { code?: string; message?: string }) => {
        const description = payload?.message ?? 'Error en el websocket de notificaciones';
        toast.error('Error en el websocket de notificaciones', { description });
        // eslint-disable-next-line no-console
        console.error(`[notifications][ws] ${description}`, payload);
      },
    },
    onError: (error) => {
      toast.error('Error en el websocket de notificaciones', {
        description: error instanceof Error ? error.message : String(error),
      });
      // eslint-disable-next-line no-console
      console.error('[notifications][ws] connection error', error);
    },
  });

  function emitTyped<EventName extends keyof typeof EVENTS>(event: EventName, payload?: unknown) {
    return emit(EVENTS[event], payload);
  }

  return emitTyped;
}
