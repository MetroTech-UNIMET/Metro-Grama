import axios from '@/axiosConfig';

import type { SubjectStats } from '@/interfaces/Subject';

export interface Query_SubjectStats {
  studentFilter?: 'all' | 'friends' | 'friendFriends';
  careers?: string[];
  startingTrimester?: string;
  endingTrimester?: string;
}

export async function getSubjectStats(subjectId: string, query?: Query_SubjectStats) {
  const { careers, ...restQuery } = query ?? {};

  const newQuery = { ...restQuery, careers: careers?.join(',') };

  const response = await axios.get<SubjectStats[]>(`/stats/subjects/${subjectId}`, { params: newQuery });

  return response.data;
}
