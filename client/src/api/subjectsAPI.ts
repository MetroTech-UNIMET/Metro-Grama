import axios from "@/axiosConfig";
import { Subject } from "@/interfaces/Subject";

export async function getSubjects(): Promise<Graph<Subject>> {
  const response = await axios.get("/subjects/sistemas");
  return response.data;
}
