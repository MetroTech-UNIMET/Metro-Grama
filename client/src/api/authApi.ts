import axios from '@/axiosConfig';

import type { Student } from '@/interfaces/Student';
import type { RegisterStudentOutput } from '@/pages/(auth)/register/student/components/RegisterStudentForm/schema';

export async function logOutGoogle() {
  return await axios.get('/auth/google/logout');
}

export async function completeStudent(userId: string, data: RegisterStudentOutput) {
  return await axios.post<Student>(`/auth/${userId}/complete-student/`, data);
}
