import axios from '@/axiosConfig';

import type { SubjectScheduleOutput } from '@/features/weekly-schedule/weekly-schedule-sidebar/components/SubjectOfferDetail/SubjectOfferForm/schema';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';
import type { SuccessResponse } from './types';

export async function createSubjectSchedule(data: SubjectScheduleOutput) {
  const response = await axios.post('/subject_schedule/', data);
  return response.data as SuccessResponse<SubjectSchedule[]>;
}
