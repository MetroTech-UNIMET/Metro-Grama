import axios from '@/axiosConfig';

import type { SuccessResponse } from '../types';
import type { StudentPreferencesEntity } from '@/interfaces/preferences/StudentPreferences';
import type { StudentSettingsFormOutput } from '@/features/student/Settings/schema';

export async function getMyStudentPreferences() {
  const res = await axios.get<SuccessResponse<StudentPreferencesEntity>>('/student_preferences/');
  return res.data.data;
}

export async function updateMyStudentPreferences(data: StudentSettingsFormOutput) {
  const res = await axios.put<SuccessResponse<StudentPreferencesEntity>>('/student_preferences/', data);
  return res.data.data;
}
