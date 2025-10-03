import axios from '@/axiosConfig';

import type { SuccessResponse } from '../types';
import type { FriendEntity } from '@/interfaces/Friend';

export async function addFriend(studentId: string) {
  const { data } = await axios.post<SuccessResponse<FriendEntity>>(`/friend/add/${studentId}`);
  return data.data;
}

export async function eliminateFriend(studentId: string) {
  const { data } = await axios.delete<SuccessResponse<FriendEntity>>(`/friend/eliminate/${studentId}`);
  return data.data;
}

export async function acceptFriend(studentId: string) {
  const { data } = await axios.post<SuccessResponse<FriendEntity>>(`/friend/accept/${studentId}`);
  return data.data;
}