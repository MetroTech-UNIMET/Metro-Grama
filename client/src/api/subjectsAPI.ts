import axios from '@/axiosConfig';

import type { Graph } from '@/interfaces/Graph';
import type { Subject, SubjectEntity, SubjectNoCareers } from '@/interfaces/Subject';
import type { ElectiveFormOutput } from '@/features/grafo/ElectiveInfo/schema';

export async function getSubjectsGraph(careerParam: string) {
  if (careerParam === 'none') return { nodes: [], edges: [] };

  const response = await axios.get<Graph<Subject>>('/subjects/graph/', {
    params: {
      careers: careerParam,
    },
  });

  return response.data;
}

export async function getSubjects(careerParam: string) {
  const response = await axios.get<Subject[]>('/subjects/', {
    params: {
      careers: careerParam,
    },
  });

  return response.data;
}

export async function getSubjectsElectivesGraph() {
  const response = await axios.get<Graph<SubjectNoCareers>>('/subjects/electives/graph/');

  return response.data;
}

export async function createSubjectElective(data: ElectiveFormOutput) {
  const response = await axios.post<Omit<SubjectEntity, 'careers'>>('/subjects/electives/', data);
  return response.data;
}
