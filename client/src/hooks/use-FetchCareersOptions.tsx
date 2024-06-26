import { getCareers } from "@/api/careersApi";
import { Career } from "@/interfaces/Career";
import { Option } from "@ui/derived/multidropdown";
import { useQuery } from "@tanstack/react-query";

export interface CareerOption extends Option {
  query: string;
}

export default function useFetchCareersOptions() {
  const { data, isLoading, error } = useQuery<Career[]>({
    queryKey: ["careers"],
    queryFn: getCareers,
  });

  const options: CareerOption[] =
    data?.map((career) => ({
      value: career.name,
      label: `${career.emoji} ${career.name}`,
      query: career.id,
    })) ?? [];

  return {
    options,
    isLoading,
    error,
  };
}
