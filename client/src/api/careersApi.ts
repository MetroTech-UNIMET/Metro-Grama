import axios from "@/axiosConfig";
import { idToSurrealId } from "@utils/queries";

import type { Career, CareerWithSubjects } from "@/interfaces/Career";

export async function getCareers(): Promise<Career[]> {
  const response = await axios.get("/careers/");

  return response.data;
}

export async function createCareer(data: any) {
  return await axios.post("/careers/", data);
}

// TODO - Hacer endpoint
export async function updateCareer(data: any) {
  return await axios.put("/careers/", data);
}

export async function getCompleteCareer(id?: string): Promise<CareerWithSubjects> {
  if (!id) throw new Error("No id provided");
  
  const surrealId = idToSurrealId(id, "career");
  const response = await axios.get(`/careers/withSubjects/${surrealId}`);

  return response.data;
}