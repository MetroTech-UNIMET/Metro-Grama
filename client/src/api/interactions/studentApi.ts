import axios from '@/axiosConfig';
import type { SuccessResponse } from '../types';
import type { Id } from '@/interfaces/surrealDb';


export async function getStudentCareers() {
  const { data } = await axios.get<SuccessResponse<Id[]>>('/student/career');
  return data.data
}
