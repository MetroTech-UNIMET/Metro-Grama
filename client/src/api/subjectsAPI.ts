import axios from '@/axiosConfig';

import type { Graph } from '@/interfaces/Graph';
import type { Subject, SubjectNoCareers } from '@/interfaces/Subject';

export async function getSubjectsGraph(careerParam: string) {
  if (careerParam === 'none') return { nodes: [], edges: [] };

  const response = await axios.get<Graph<Subject>>('/subjects/graph/', {
    params: {
      careers: careerParam,
    },
  });

  return response.data;
}

export async function getSubjects(careerParam: string): Promise<Subject[]> {
  const response = await axios.get('/subjects/', {
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
