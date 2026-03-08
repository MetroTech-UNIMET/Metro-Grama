import { useState, useCallback, Suspense, lazy } from 'react';

import SearchPrelations from './behaviors/Search-Prelations';
import { MenuActions, type SubjectNode } from './behaviors/MenuActions';
import CreditsMenu from './behaviors/CreditsMenu';
import UpdateNodeStatusOnGraphChange from './behaviors/Update-Node-Status-OnGraphChange';
import { useStatusActions } from './behaviors/StatusActions';

import { HeaderGraph } from './HeaderGraph';
const ElectiveInfo = lazy(() => import('./ElectiveInfo/ElectiveInfo').then((m) => ({ default: m.ElectiveInfo })));
const EnrollDialog = lazy(() => import('./EnrollDialog/EnrollDialog'));

import useIsElective from './hooks/use-is-elective';

import { ShowAxiosError } from '@components/ShowAxiosError';

import { Spinner } from '@ui/spinner';
import { ContextMenu } from '@ui/context-menu';
import { Dialog, DialogContent } from '@ui/dialog';

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
  const { nodeActions } = useStatusActions();

  const electiveInfoFallback = (
    <div className="fixed right-8 top-10 z-10 grid size-10 place-items-center rounded-md border bg-background/90 md:top-24 max-[21rem]:top-44">
      <Spinner size="small" />
    </div>
  );

  const enrollDialogFallback = (
    <DialogContent className="grid h-80 place-items-center p-0">
      <Spinner />
    </DialogContent>
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedSubjectDialog(null);
  }, []);

  const handleAfterSubmit = useCallback(
    (data: { grade: number }) => {
      if (!selectedSubjectDialog) throw new Error('No se encontró la materia seleccionada');

      if (data.grade >= 10) nodeActions.enableViewedNode(selectedSubjectDialog);
      else if (selectedSubjectDialog.hasState('viewed'))
        nodeActions.disableViewedNode(selectedSubjectDialog, selectedSubjectDialog.getOutEdges());

      setSelectedSubjectDialog(null);
    },
    [selectedSubjectDialog, nodeActions],
  );

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

      <Suspense fallback={electiveInfoFallback}>
        {onlyElectives && <ElectiveInfo buttonClassName="fixed right-8 top-10 md:top-24 z-10 max-[21rem]:top-44" />}
      </Suspense>

      {selectedCareers.length === 0 && !onlyElectives ? (
        <>
          <div className="grid h-full place-items-center">
            <h1 className="text-center text-4xl">Selecciona una carrera para ver el flujograma</h1>
          </div>
        </>
      ) : (
        <div className="h-full overflow-hidden">
          <Dialog open={!!selectedSubjectDialog} onOpenChange={handleOpenChange}>
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

            <Suspense fallback={enrollDialogFallback}>
              {selectedSubjectDialog && (
                <EnrollDialog
                  subject={selectedSubjectDialog._cfg.model.data.data}
                  afterSubmit={handleAfterSubmit}
                  isEditMode={selectedSubjectDialog.hasState('viewed')}
                />
              )}
            </Suspense>
          </Dialog>
        </div>
      )}
    </>
  );
}
