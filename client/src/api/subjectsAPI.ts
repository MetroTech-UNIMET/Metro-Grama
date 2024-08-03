import axios from "@/axiosConfig";
import type { Subject } from "@/interfaces/Subject";

export async function getSubjects(
  careerParam: string
): Promise<Graph<Subject>> {
  if (careerParam === "none") return { nodes: [], edges: [] };

  const response = await axios.get("/subjects/", {
    params: {
      careers: careerParam,
    },
  });

  return response.data;
}
