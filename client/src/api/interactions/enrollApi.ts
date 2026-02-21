import axios from '@/axiosConfig';

import type { EnrollDialogOutput } from '@/features/grafo/EnrollDialog/schema';
import type { SuccessResponse } from '../types';
import type { EnrollEntity } from '@/interfaces/Enroll';

export async function enrollStudent(subjectCode: string, dataToCreate: EnrollDialogOutput) {
  const { data } = await axios.post<SuccessResponse<EnrollEntity>>(`/enroll/${subjectCode}`, dataToCreate);

  return data;
}

export async function updateEnrolledStudent(subjectCode: string, dataToUpdate: EnrollDialogOutput) {
  const { data } = await axios.put<SuccessResponse<EnrollEntity>>(`/enroll/${subjectCode}`, dataToUpdate);
  return data;
}

export async function getEnrollment(subjectCode: string) {
  const { data } = await axios.get<SuccessResponse<EnrollEntity>>(`/enroll/${subjectCode}`);
  return data.data;
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
