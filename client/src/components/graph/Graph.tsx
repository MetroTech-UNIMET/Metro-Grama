import Graphin from "@antv/graphin";
import { AxiosError } from "axios";

import SearchPrelations from "./behaviors/Search-Prelations";
import MenuActions from "./behaviors/MenuActions";
// import SideBarGraph from "./SideBarGraph";

import useSubjectGraph from "@/hooks/useSubjectGraph";
import { ShowAxiosError } from "@components/ShowAxiosError";
import { CareerMultiDropdown } from "@components/CareerMultiDropdown";

import GoogleLogin from "@ui/derived/GoogleLogin";

import useFecthSubjectByCareer from "@/hooks/use-FecthSubjectByCareer";

export default function Graph() {
  const { data, error, isLoading, selectedCareers, setSelectedCareers } =
    useFecthSubjectByCareer();

  const { graph } = useSubjectGraph(data, selectedCareers);

  if (error) return <ShowAxiosError error={error as AxiosError} />;

  return (
    <>
      <div className="fixed flex flex-wrap flex-row gap-4 z-10 w-full pr-12">
        <GoogleLogin />

        <CareerMultiDropdown
          loadingSubjects={isLoading}
          value={selectedCareers}
          onChange={setSelectedCareers}
        />
      </div>

      {selectedCareers.length === 0 ? (
        <>
          <div className="h-full grid place-items-center ">
            <h1 className="text-4xl text-center">
              Selecciona una carrera para ver el flujograma
            </h1>
          </div>
        </>
      ) : (
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
      )}
    </>
  );
}
