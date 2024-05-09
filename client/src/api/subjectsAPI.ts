import axios from "@/axiosConfig";
import { Subject } from "@/interfaces/Subject";

export async function getSubjects(
  filterParam: string
): Promise<Graph<Subject>> {
  console.log({ filterParam });

  const response = await axios.get("/subjects/", {
    params: {
      filter: filterParam,
    },
  });

  return response.data;
}
