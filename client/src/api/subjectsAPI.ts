import axios from "@/axiosConfig";

export async function getSubjects(): Promise<Graph<Subject>> {
  const response = await axios.get("/subjects/Ingeniería de sistemas");
  return response.data;
}
