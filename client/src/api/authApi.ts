import axios from '@/axiosConfig';

import type { StudentWithUser } from '@/interfaces/Student';
import type { RegisterStudentOutput } from '@/routes/register/components/RegisterStudentForm/schema';

export async function logOutGoogle() {
  return await axios.get('/auth/google/logout');
}

export async function completeStudent(userId: string, data: RegisterStudentOutput) {
  return await axios.post<StudentWithUser>(`/auth/${userId}/complete-student/`, data);
}
