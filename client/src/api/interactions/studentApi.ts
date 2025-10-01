import axios from '@/axiosConfig';

import type { SuccessResponse } from '../types';
import type { Id } from '@/interfaces/surrealDb';
import type { StudentDetails } from '@/interfaces/Student';


export async function getStudentCareers() {
  const { data } = await axios.get<SuccessResponse<Id[]>>('/student/career');
  return data.data
}

export async function getStudentDetails() {
  const { data } = await axios.get<SuccessResponse<StudentDetails>>('/student/details');
  return data.data;
}

export async function getStudentByID(studentId: string) {
  const { data } = await axios.get<SuccessResponse<StudentDetails>>(`/student/profile/${studentId}`);
  return data.data;
}