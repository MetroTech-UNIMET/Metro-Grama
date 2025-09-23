import axios from "@/axiosConfig";

import type { Career, CareerWithSubjects } from "@/interfaces/Career";

export async function getCareers(): Promise<Career[]> {
  const response = await axios.get("/careers/");

  return response.data;
}

export async function createCareer(data: any) {
  return await axios.post("/careers/", data);
}

export async function updateCareer(oldCareer: CareerWithSubjects, newCareer: any) {
  return await axios.patch(`/careers/withSubjects/${oldCareer.id}`, {
    oldCareer,
    newCareer
  });
}

export async function getCompleteCareer(id: string): Promise<CareerWithSubjects> {
  const response = await axios.get(`/careers/withSubjects/${id}`);

  return response.data;
}