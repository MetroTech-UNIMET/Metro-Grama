import axios from "@/axiosConfig";
import type { Career } from "@/interfaces/Career";

export async function getCareers(): Promise<Career[]> {
  const response = await axios.get("/careers/");

  return response.data;
}

export async function createCareers(data: any) {
  console.log(data)
  return await axios.post("/careers/", data);
}
