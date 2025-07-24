import { useQuery } from "@tanstack/react-query";
import { getCareers } from "@/api/careersApi";

import type { Option } from "@ui/types";
import type { Career } from "@/interfaces/Career";

export default function useFetchCareersOptions() {
  const { data, isLoading, error } = useQuery<Career[]>({
    queryKey: ["careers"],
    queryFn: getCareers,
  });

  const options: Option[] =
    data?.map((career) => ({
      value: `${career.id.Table}:${career.id.ID}`,
      label: `${career.emoji} ${career.name}`,
    })) ?? [];

  return {
    options,
    isLoading,
    error,
  };
}
