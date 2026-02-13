import { useState } from 'react';

import SearchPrelations from './behaviors/Search-Prelations';
import { MenuActions, type SubjectNode } from './behaviors/MenuActions';
import CreditsMenu from './behaviors/CreditsMenu';
import UpdateNodeStatusOnGraphChange from './behaviors/Update-Node-Status-OnGraphChange';

import { HeaderGraph } from './HeaderGraph';
import { ElectiveInfo } from './ElectiveInfo/ElectiveInfo';
import EnrollDialog from './EnrollDialog/EnrollDialog';

import useIsElective from './hooks/use-is-elective';

import { ShowAxiosError } from '@components/ShowAxiosError';

import { Spinner } from '@ui/spinner';
import { ContextMenu } from '@ui/context-menu';
import { Dialog } from '@ui/dialog';

import useSubjectGraph from '@/features/grafo/hooks/useSubjectGraph/useSubjectGraph';

import { useFetchSubjectsGraphByCareer } from '@/hooks/queries/subject/use-FecthSubjectsGraphByCareer';
import { useFetchCareersOptions } from '@/hooks/queries/career/use-fetch-careers';
import useFetchSubjectsElectivesGraph from '@/hooks/queries/subject/use-fetch-subjects-electives-graph';

import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';

import useLazyGraphin from '@/hooks/lazy-loading/use-LazyGraphin';

import type { AxiosError } from 'axios';

export default function Graph() {
  const careerOptionsQuery = useFetchCareersOptions();

  const [selectedSubjectDialog, setSelectedSubjectDialog] = useState<SubjectNode | null>(null);
  const { onlyElectives, setOnlyElectives } = useIsElective();

  const { selectedCareers, setSelectedCareers } = useSelectedCareers({
    activeUrl: '/_navLayout/materias/',
    careerOptions: careerOptionsQuery.data,
    useStudentCareersAsDefault: true,
  });

  const subjectsElectivesQuery = useFetchSubjectsElectivesGraph({
    queryOptions: {
      enabled: onlyElectives,
    },
  });
  const subjectsByCareerQuery = useFetchSubjectsGraphByCareer({
    queryOptions: {
      enabled: !onlyElectives,
    },
  });

  const queryToUse = onlyElectives ? subjectsElectivesQuery : subjectsByCareerQuery;

  const { graph } = useSubjectGraph(queryToUse.data, selectedCareers);

  const { graphinImport, error: graphinError } = useLazyGraphin();

  if (queryToUse.error) return <ShowAxiosError error={queryToUse.error as AxiosError} />;
  if (graphinError) return <ShowAxiosError error={graphinError as AxiosError} />;

  if ((!queryToUse.data && graph.nodes.length === 0) || !graphinImport) {
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
      <HeaderGraph
        selectedCareers={selectedCareers}
        setSelectedCareers={setSelectedCareers}
        onlyElectives={onlyElectives}
        setOnlyElectives={setOnlyElectives}
        loadingSubjects={subjectsByCareerQuery.isLoading}
        loadingCareers={careerOptionsQuery.isLoading}
      />

      {onlyElectives && <ElectiveInfo buttonClassName="fixed right-8 top-20 z-10" />}

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
                layout={{ type: onlyElectives ? 'circular' : 'dagre' }}
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
