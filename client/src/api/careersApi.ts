import axios from '@/axiosConfig';

import type { CreateCareerOutput } from '@/features/admin/careers/schema';
import type { Career, CareerWithSubjects } from '@/interfaces/Career';

export async function getCareers(): Promise<Career[]> {
  const response = await axios.get('/careers/');

  return response.data;
}

// El casting del tipo subjects es complicaíto
export async function createCareer(data: Omit<CreateCareerOutput, 'subjects'>) {
  return await axios.post('/careers/', data);
}

export async function updateCareer(oldCareer: CareerWithSubjects, newCareer: any) {
  return await axios.patch(`/careers/withSubjects/${oldCareer.id}`, {
    oldCareer,
    newCareer,
  });
}

export async function getCompleteCareer(id: string): Promise<CareerWithSubjects> {
  const response = await axios.get(`/careers/withSubjects/${id}`);

  return response.data;
}
