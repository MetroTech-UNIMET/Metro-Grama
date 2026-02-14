import axios from '@/axiosConfig';

import type { EnrollDialogOutput } from '@/features/grafo/EnrollDialog/schema';
import type { SuccessResponse } from '../types';

export async function enrollStudent(subjectCode: string, data: EnrollDialogOutput) {
  return (await axios.post<SuccessResponse<any>>(`/enroll/${subjectCode}`, data)).data;
}

export async function unenrollStudent(subjects: string[]) {
  return await axios.delete('/enroll/', {
    data: {
      subjects,
    },
  });
}

export interface QueryEnrollParams {
  onlyPassed?: boolean;
}

export async function getEnrolledSubjects({ onlyPassed }: QueryEnrollParams = {}): Promise<string[]> {
  const response = await axios.get<SuccessResponse<string[]>>('/enroll/', {
    params: {
      onlyPassed,
    },
  });

  return response.data.data;
}
