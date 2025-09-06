import axios from '@/axiosConfig';

import type { GetCourseByTrimesterResponse } from './course.types';

import type { Course } from '@/interfaces/Course';
import type { CourseSchemaOutput } from '@/routes/horario/components/schema';

export async function createSchedule(data: CourseSchemaOutput) {
  return await axios.post<Course>('/course/', data);
}

export interface QueryCourseParams {
  is_principal?: boolean;
}

export async function getStudentCourseByTrimester(trimesterId: string, params: QueryCourseParams = {}) {
  const query = new URLSearchParams();
  if (params.is_principal !== undefined) query.append('is_principal', String(params.is_principal));
  const { data } = await axios.get<GetCourseByTrimesterResponse>(`/course/${trimesterId}?${query.toString()}`);
  return data;
}
