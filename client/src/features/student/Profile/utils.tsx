import type { OtherStudentDetails, MyStudentDetails } from '@/interfaces/Student';

export function isMyProfile(data: OtherStudentDetails | MyStudentDetails): data is MyStudentDetails {
  return (data as MyStudentDetails).pending_friends !== undefined;
}
