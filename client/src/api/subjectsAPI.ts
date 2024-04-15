import axios from "@/axiosConfig";
import { Subject } from "@/interfaces/Subject";

export async function getSubjects(
  selectedCareers: string[]
): Promise<Graph<Subject>> {
  const queryParam =
    selectedCareers.length === 0
      ? "?filter=all"
      : `?filter=career:${selectedCareers.join(",")}`;

  const response = await axios.get(`/subjects/${queryParam}`);

  return response.data;
}
