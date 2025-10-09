import { useState } from 'react';

import SearchPrelations from './behaviors/Search-Prelations';
import { MenuActions, type SubjectNode } from './behaviors/MenuActions';
import CreditsMenu from './behaviors/CreditsMenu';
import UpdateNodeStatusOnGraphChange from './behaviors/Update-Node-Status-OnGraphChange';

import EnrollDialog from './EnrollDialog/EnrollDialog';
// import SideBarGraph from "./SideBarGraph";

import { ShowAxiosError } from '@components/ShowAxiosError';
import { CareerMultiDropdown } from '@components/CareerMultiDropdown';

import { Spinner } from '@ui/spinner';
import GoogleLogin from '@ui/derived/GoogleLogin';
import { ContextMenu } from '@ui/context-menu';
import { Dialog } from '@ui/dialog';

import useSubjectGraph from '@/features/grafo/hooks/useSubjectGraph/useSubjectGraph';

import useFecthSubjectsGraphByCareer from '@/hooks/queries/subject/use-FecthSubjectsGraphByCareer';
import { useFetchCareersOptions } from '@/hooks/queries/career/use-fetch-careers';

import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';

import useLazyGraphin from '@/hooks/lazy-loading/use-LazyGraphin';

import type { AxiosError } from 'axios';

export default function Graph() {
  const careerOptionsQuery = useFetchCareersOptions();

  const [selectedSubjectDialog, setSelectedSubjectDialog] = useState<SubjectNode | null>(null);

  const { selectedCareers, setSelectedCareers } = useSelectedCareers({
    activeUrl: '/_navLayout/materias/',
    careerOptions: careerOptionsQuery.data,
    useStudentCareersAsDefault: true,
  });

  const { data, error, isLoading } = useFecthSubjectsGraphByCareer();

  const { graph } = useSubjectGraph(data, selectedCareers);

  const { graphinImport, error: graphinError } = useLazyGraphin();

  if (error) return <ShowAxiosError error={error as AxiosError} />;
  if (graphinError) return <ShowAxiosError error={graphinError as AxiosError} />;

  if ((!data && graph.nodes.length === 0) || !graphinImport) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner size="giant" />
      </div>
    );
  }

  const { Graphin, Behaviors } = graphinImport;
  const { Hoverable } = Behaviors;

  return (
    <>
      <div className="fixed z-10 flex w-full flex-row flex-wrap gap-4 pr-12">
        {/* <SideBarGraph /> */}

        <GoogleLogin />

        <CareerMultiDropdown
          value={selectedCareers}
          onChange={setSelectedCareers}
          loadingSubjects={isLoading}
          isLoading={careerOptionsQuery.isLoading}
        />
      </div>

      {selectedCareers.length === 0 ? (
        <>
          <div className="grid h-full place-items-center">
            <h1 className="text-center text-4xl">Selecciona una carrera para ver el flujograma</h1>
          </div>
        </>
      ) : (
        <div className="h-full overflow-hidden">
          <Dialog open={!!selectedSubjectDialog} onOpenChange={(open) => !open && setSelectedSubjectDialog(null)}>
            <ContextMenu>
              <Graphin
                data={graph}
                style={{
                  backgroundColor: 'transparent',
                  position: 'relative',
                }}
                layout={{ type: 'dagre' }}
              >
                <Hoverable bindType="node" />
                <SearchPrelations />
                <MenuActions selectSubjectDialog={setSelectedSubjectDialog} />
                <CreditsMenu />

                <UpdateNodeStatusOnGraphChange graphData={graph} />
              </Graphin>
            </ContextMenu>

            <EnrollDialog
              selectedSubjectNode={selectedSubjectDialog}
              afterSubmit={() => setSelectedSubjectDialog(null)}
            />
          </Dialog>
        </div>
      )}
    </>
  );
}
