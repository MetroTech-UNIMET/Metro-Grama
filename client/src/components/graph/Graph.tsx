import Graphin from "@antv/graphin";
import { AxiosError } from "axios";

import SearchPrelations from "./behaviors/Search-Prelations";
import MenuActions from "./behaviors/MenuActions";
import SideBarGraph from "./SideBarGraph";

import useSubjectGraph from "@/hooks/useSubjectGraph";
import { ShowAxiosError } from "@components/ShowAxiosError";
import { CareerMultiDropdown } from "@components/CareerMultiDropdown";

import { Spinner } from "@ui/spinner";
import { Toaster } from "@ui/toaster";
import useFecthSubjectByCareer from "@/hooks/use-FecthSubjectByCareer";
import GoogleLogin from "@ui/derived/GoogleLogin";

export default function Graph() {
  const {
    data,
    error,
    isLoading,
    isRefetching,
    selectedCareers,
    setSelectedCareers,
  } = useFecthSubjectByCareer();

  const { graph } = useSubjectGraph(data, selectedCareers);

  if (error) return <ShowAxiosError error={error as AxiosError} />;

  if (isLoading || !data)
    return (
      <div className="h-full grid place-items-center ">
        <Spinner size="giant" />
      </div>
    );

  return (
    <>
      <div className="fixed flex flex-wrap-reverse flex-row gap-4 z-10 w-full pr-12">
        <GoogleLogin />

        <CareerMultiDropdown
          loadingSubjects={isRefetching}
          value={selectedCareers}
          onChange={setSelectedCareers}
        />
      </div>

      <Graphin
        data={graph}
        style={{
          backgroundColor: "transparent",
        }}
        layout={{ type: "dagre" }}
      >
        <SearchPrelations />
        <MenuActions />
      </Graphin>
      <Toaster />
    </>
  );
}
