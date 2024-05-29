import { Career } from "@/interfaces/Career";
import axios from "@/axiosConfig";

export async function getCareers(): Promise<Career[]> {
  const response = await axios.get("/careers/");

  return response.data;
}
