import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import CareerForm from "@/features/admin/careers/CareerForm";
import { getCompleteCareer } from "@/api/careersApi";
import { Spinner } from "@ui/spinner";

export default function UpdateCareer() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["career", id],
    queryFn: () => getCompleteCareer(id),
  });

  // TODO - Mejor maneo de loading y error
  if (isLoading) return <Spinner />;

  if (!data) return null;

  console.log(data)
  return <CareerForm mode="edit" data={data} />;
}
