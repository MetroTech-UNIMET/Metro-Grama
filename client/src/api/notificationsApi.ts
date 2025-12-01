import axios from '@/axiosConfig';

import type { Notification } from '@/interfaces/Notifications';
import type { Id } from '@/interfaces/surrealDb';
import { SuccessResponse } from './types';

export interface NotificationDTO {
  all: Notification[];
  unread: Notification[];
}

export interface MarkNotificationsAsReadPayload {
  notifications: Id[];
}

export async function getNotifications() {
  const response = await axios.get<SuccessResponse<NotificationDTO>>('/notifications/');
  return response.data.data;
}

export async function markNotificationsAsRead(payload: MarkNotificationsAsReadPayload) {
  const response = await axios.put<SuccessResponse<Notification[]>>('/notifications/mark-as-read', payload);
  return response.data.data;
}
