import { AlertCircle } from 'lucide-react';

import { SubjectStatsCareerFilter } from './SubjectStatsFilters';
import { SubjectStatsQueryProvider, useSubjectStatsQueryContext } from './context/subject-stats-query-context';
import { GradeChart, OpinionChart } from './SubjectCharts';

import { useFetchSubjectStats } from '@/hooks/queries/stats/use-fetch-subject-stats';

import { Button } from '@ui/button';
import { SheetDescription, SheetHeader, SheetTitle } from '@ui/sheet';
import { Badge } from '@ui/badge';
import { Skeleton } from '@ui/skeleton';
import { Card } from '@ui/card';

import type { Subject } from '@/interfaces/Subject';

interface Props {
  subject: Subject;
  popoverContainer: HTMLElement | undefined;
}
// TODO - Starting trimester and ending, filtrar opiniones por carrera
export function SubjectSheetBody({ subject, popoverContainer }: Props) {
  return (
    <SubjectStatsQueryProvider>
      <>
        <SheetHeader>
          <SheetTitle>
            {subject.name} ({subject.code.ID})
          </SheetTitle>
          <section className="flex flex-wrap justify-center gap-4">
            {subject.careers.map((career) => (
              <Badge key={career.ID} className="line-clamp-1">
                {career.ID}
              </Badge>
            ))}
          </section>

          <SheetDescription></SheetDescription>

          <SubjectStatsCareerFilter popoverContainer={popoverContainer} />
        </SheetHeader>

        <StatsSection subject={subject} />

        {/* REVIEW - Considerar poner acciones */}
        {/* <SheetFooter>Proximamente...</SheetFooter> */}
      </>
    </SubjectStatsQueryProvider>
  );
}

function StatsSection({ subject }: { subject: Subject }) {
  const { selectedCareers, selectedStudentsFilter, startingTrimester, endingTrimester } = useSubjectStatsQueryContext();

  const subjectStatsQuery = useFetchSubjectStats(subject.code.ID, {
    optionalQuery: {
      careers: selectedCareers.map((careerO) => careerO.id),
      studentFilter: selectedStudentsFilter,
      startingTrimester,
      endingTrimester,
    },
  });

  return (
    <main className="mt-2 space-y-4">
      {subjectStatsQuery.isPending ? (
        <>
          <Skeleton className="h-48 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
        </>
      ) : subjectStatsQuery.isError ? (
        <Card className="bg-destructive/15 text-destructive flex flex-col items-center gap-2 border-0 md:flex-row md:gap-4">
          <AlertCircle className="mx-auto size-10 shrink-0" />
          <div className="flex flex-col gap-2">
            <p className="text-center">No se han podido cargar las estadísticas</p>
            <Button colors="destructive" className="self-center" onClick={() => subjectStatsQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {subjectStatsQuery.data?.length === 0 ? (
            <Card className="bg-warning text-warning-foreground flex flex-col items-center gap-2 border-0 md:flex-row md:gap-4">
              <AlertCircle className="mx-auto size-10 shrink-0" />
              <p className="text-center">
                No hay estadísticas disponibles para esta materia. Añade tu opinión o espera que tus compañeros lo hagan
              </p>
            </Card>
          ) : (
            <>
              <GradeChart data={subjectStatsQuery.data} />
              <OpinionChart data={subjectStatsQuery.data} />
            </>
          )}
        </>
      )}
    </main>
  );
}
