import { useCallback, useState } from 'react';
import { Bell, CheckIcon } from 'lucide-react';

import { useNotificationWebsocket } from './use-notification-websocket';
import { NotificationList } from './NotificationList';

import { useFetchNotifications } from '@/hooks/queries/notifications/use-fetch-notifications';

import { Button } from '@ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { cn } from '@utils/className';

interface Props {
  isDockVisible: boolean;
}

export function NotificationButton({ isDockVisible }: Props) {
  const { data, isLoading } = useFetchNotifications();

  const emit = useNotificationWebsocket();

  const handleMarkAsRead = useCallback(() => {
    const unreadNotifications = data?.unread ?? [];
    if (unreadNotifications.length === 0) return;

    emit('MARK_READ', {
      notifications: unreadNotifications.map((notification) => notification.id),
    });
  }, [data?.unread, emit]);

  const unreadCount = data?.unread?.length ?? 0;

  // TODO - Loading more should be implement with useInfiniteQuery
  const [loadingMore, setLoadingMore] = useState(false);

  // Placeholder to integrate infinite loading later.
  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      // TODO: implement pagination / infinite loading
      // Example: await fetchMoreNotifications({ before: lastOlderCreatedAt })
      console.debug('loadMore placeholder called');
    } finally {
      setLoadingMore(false);
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'fixed bottom-4 left-4 z-50 size-12 rounded-full transition-transform [&_svg]:size-6',
            isDockVisible && 'max-sm:translate-y-16',
          )}
          colors="secondary"
        >
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 p-3 text-[10px] text-white">
              {unreadCount > 100 ? '+99' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="max-h-96 w-80 overflow-y-auto p-0">
        <div className="flex flex-row items-center justify-between p-4">
          <div className="text-lg font-semibold">Notificaciones</div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleMarkAsRead} disabled={unreadCount === 0}>
                <CheckIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Marcar todas como leídas</TooltipContent>
          </Tooltip>
        </div>

        <div className="p-2">
          <Tabs defaultValue="all">
            <TabsList className="mb-2" variant="ghost">
              <TabsTrigger variant="ghost" value="all">
                Todas
              </TabsTrigger>
              <TabsTrigger variant="ghost" value="unread">
                No leídas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : (
                <NotificationList
                  notifications={data?.all ?? []}
                  emptyMessage="No tienes notificaciones"
                  onLoadMore={handleLoadMore}
                  loadingMore={loadingMore}
                />
              )}
            </TabsContent>

            <TabsContent value="unread">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : (
                <NotificationList
                  notifications={data?.unread ?? []}
                  emptyMessage="No tienes notificaciones sin leer"
                  grouped={false}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
