import axios from '@/axiosConfig';

import type { SubjectStats } from '@/interfaces/Subject';

export async function getSubjectStats(subjectId: string) {
  const response = await axios.get<SubjectStats[]>(`/stats/subjects/${subjectId}`);

  return response.data;
}
