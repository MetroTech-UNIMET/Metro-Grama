import { useMemo } from 'react';

import { NotificationListItem } from './NotificationItem/NotificationListItem';

import { surrealIdToId } from '@utils/queries';

import { Button } from '@ui/button';

import type { Notification } from '@/interfaces/Notifications';

interface NotificationListProps {
  notifications: Notification[];
  emptyMessage?: React.ReactNode;
  grouped?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  newThreshold?: number;
  showLoadMore?: boolean;
}

export function NotificationList({
  notifications,
  emptyMessage = 'No tienes notificaciones',
  grouped = true,
  onLoadMore,
  loadingMore = false,
  newThreshold = 5,
  showLoadMore = true,
}: NotificationListProps) {
  if (!notifications || notifications.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-500">{emptyMessage}</div>;
  }

  if (!grouped) {
    return (
      <div className="flex flex-col">
        {notifications.map((notification) => (
          <NotificationListItem key={surrealIdToId(notification.id)} notification={notification} />
        ))}
      </div>
    );
  }

  // TODO - Mejorar logica y ordenarlos en base a createdAt y hacerlo  Hoy/Anteriores
  // El ordenamiento es desde el server
  const newNotifications = useMemo(() => notifications.slice(0, newThreshold), [notifications, newThreshold]);
  const olderNotifications = useMemo(() => notifications.slice(newThreshold), [notifications, newThreshold]);

  return (
    <div className="flex flex-col">
      {newNotifications.length > 0 && (
        <div className="p-3">
          <div className="mb-2 text-xs font-semibold text-gray-500">Nuevas</div>
          <div className="flex flex-col">
            {newNotifications.map((notification) => (
              <NotificationListItem key={surrealIdToId(notification.id)} notification={notification} />
            ))}
          </div>
        </div>
      )}

      {olderNotifications.length > 0 && (
        <div className="p-3">
          <div className="mb-2 text-xs font-semibold text-gray-500">Anteriores</div>
          <div className="flex flex-col">
            {olderNotifications.map((notification) => (
              <NotificationListItem key={surrealIdToId(notification.id)} notification={notification} />
            ))}
          </div>

          {showLoadMore && onLoadMore && (
            <div className="mt-3 flex items-center justify-center">
              {/* TODO - Arreglar color en variant default */}
              <Button onClick={onLoadMore} disabled={loadingMore} size="sm" colors="neutral" className="w-full">
                {loadingMore ? 'Cargando...' : 'Ver notificaciones anteriores'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
