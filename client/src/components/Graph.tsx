import { getSubjects } from "@/api/subjectsAPI";
import Graphin from "@antv/graphin";
import { useQuery } from "react-query";

export default function Graph() {
  const { data, isLoading, error } = useQuery('subjects', getSubjects);

  return <Graphin data={data} />;
}

