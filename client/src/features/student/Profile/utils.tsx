import type { MyStudentDetails, OtherStudentDetails } from '@/api/interactions/student.types';

export function isMyProfile(data: OtherStudentDetails | MyStudentDetails): data is MyStudentDetails {
  return (data as MyStudentDetails).pending_friends !== undefined;
}
