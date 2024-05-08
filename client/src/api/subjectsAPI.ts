import axios from "@/axiosConfig";
import { Subject } from "@/interfaces/Subject";

export async function getSubjects(
  selectedCareers: string[]
): Promise<Graph<Subject>> {
  const filterParam =
    selectedCareers.length === 0
      ? "all"
      : `career:${selectedCareers.join(",")}`;

  const response = await axios.get("/subjects/", {
    params: {
      filter: filterParam,
    },
  });

  return response.data;
}
