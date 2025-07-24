import SearchPrelations from "./behaviors/Search-Prelations";
import { MenuActions } from "./behaviors/MenuActions";
import UpdateNodeStatusOnGraphChange from "./behaviors/Update-Node-Status-OnGraphChange";
import CreditsMenu from "./behaviors/CreditsMenu";
// import SideBarGraph from "./SideBarGraph";

import { ShowAxiosError } from "@components/ShowAxiosError";
import { CareerMultiDropdown } from "@components/CareerMultiDropdown";

import { Spinner } from "@ui/spinner";
import GoogleLogin from "@ui/derived/GoogleLogin";
import { ContextMenu } from "@ui/context-menu";

import useSubjectGraph from "@/features/grafo/hooks/useSubjectGraph/useSubjectGraph";
import useFecthSubjectsGraphByCareer from "@/hooks/queries/subject/use-FecthSubjectsGraphByCareer";
import useLazyGraphin from "@/hooks/lazy-loading/use-LazyGraphin";

import type { AxiosError } from "axios";

export default function Graph() {
  const { data, error, isLoading, selectedCareers, setSelectedCareers } =
    useFecthSubjectsGraphByCareer();

  const { graph } = useSubjectGraph(data, selectedCareers);

  const { graphinImport, error: graphinError } = useLazyGraphin();

  if (error) return <ShowAxiosError error={error as AxiosError} />;
  if (graphinError)
    return <ShowAxiosError error={graphinError as AxiosError} />;

  if ((!data && graph.nodes.length === 0) || !graphinImport) {
    return (
      <div className="h-full grid place-items-center ">
        <Spinner size="giant" />
      </div>
    );
  }

  const { Graphin, Behaviors } = graphinImport;
  const { Hoverable } = Behaviors;

  return (
    <>
      <div className="fixed flex flex-wrap flex-row gap-4 z-10 w-full pr-12">
        {/* <SideBarGraph /> */}

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
        <div className="overflow-hidden h-full">
          <ContextMenu>
            <Graphin
              data={graph}
              style={{
                backgroundColor: "transparent",
                position: "relative",
              }}
              layout={{ type: "dagre" }}
            >
              <Hoverable bindType="node" />
              <SearchPrelations />
              <MenuActions />
              <CreditsMenu />

              <UpdateNodeStatusOnGraphChange graphData={graph} />
            </Graphin>
          </ContextMenu>
        </div>
      )}
    </>
  );
}
