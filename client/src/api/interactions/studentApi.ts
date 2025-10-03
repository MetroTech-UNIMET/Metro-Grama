import axios from '@/axiosConfig';

import type { SuccessResponse } from '../types';
import type { Id } from '@/interfaces/surrealDb';
import type { MyStudentDetails,OtherStudentDetails } from '@/interfaces/Student';


export async function getStudentCareers() {
  const { data } = await axios.get<SuccessResponse<Id[]>>('/student/career');
  return data.data
}

export async function getStudentDetails() {
  const { data } = await axios.get<SuccessResponse<MyStudentDetails>>('/student/details');
  return data.data;
}

export async function getStudentByID(studentId: string) {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Simula un retraso de 500ms

  const { data } = await axios.get<SuccessResponse<OtherStudentDetails>>(`/student/profile/${studentId}`);
  return data.data;
}