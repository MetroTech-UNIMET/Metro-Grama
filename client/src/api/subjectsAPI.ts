import axios from "@/axiosConfig";

export async function getSubjects(): Promise<Graph<Subject>> {
  const response = await axios.get("/subjects/Ingeniería en Sistemas");
  return response.data;
}
