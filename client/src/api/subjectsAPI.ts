import axios from "@/axiosConfig";

export async function getSubjects(): Promise<Graph<Subject>> {
  const response = await axios.get("/subjects/sistemas");
  return response.data;
}
