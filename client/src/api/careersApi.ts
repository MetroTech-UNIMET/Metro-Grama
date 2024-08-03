import axios from "@/axiosConfig";
import type { Career } from "@/interfaces/Career";

export async function getCareers(): Promise<Career[]> {
  const response = await axios.get("/careers/");

  return response.data;
}
