import axios from '@/axiosConfig';

import type { SuccessResponse } from '../types';
import type { FriendEntity } from '@/interfaces/Friend';

// POST /friend/add/:studentToAdd
export async function addFriend(studentId: string) {
  const { data } = await axios.post<SuccessResponse<FriendEntity>>(`/friend/add/${studentId}`);
  return data.data;
}

// DELETE /friend/eliminate/:studentToEliminate
export async function eliminateFriend(studentId: string) {
  const { data } = await axios.delete<SuccessResponse<FriendEntity>>(`/friend/eliminate/${studentId}`);
  return data.data;
}
