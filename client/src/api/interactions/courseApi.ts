import axios from '@/axiosConfig';

import type { Course } from '@/interfaces/Course';
import type { CourseSchemaOutput } from '@/routes/horario/components/schema';

export async function createSchedule(data: CourseSchemaOutput) {
  return await axios.post<Course>('/course/', data);
}
