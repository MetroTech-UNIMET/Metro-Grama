import { getCareers } from "@/api/careersApi";
import { Career } from "@/interfaces/Career";
import { useQuery } from "react-query";

export default function useFetchCareersOptions() {
  const { data, isLoading, error } = useQuery<Career[]>(
    ["careers"],
    getCareers
  );

  const options =
    data?.map((career) => ({
      value: career.id,
      label: `${career.emoji} ${career.name}`,
    })) ?? [];

  return {
    options,
    isLoading,
    error,
  };
}
