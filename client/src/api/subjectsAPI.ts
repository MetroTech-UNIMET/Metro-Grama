import axios from "@/axiosConfig";
import { Subject } from "@/interfaces/Subject";

export async function getSubjects(
  careerParam: string
): Promise<Graph<Subject>> {
  const response = await axios.get("/subjects/", {
    params: {
      careers: careerParam,
    },
  });

  return response.data;
}
