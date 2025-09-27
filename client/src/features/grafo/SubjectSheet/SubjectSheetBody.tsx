import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@ui/sheet';
import { Badge } from '@ui/badge';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart';

import { useFetchSubjectStats } from '@/hooks/queries/stats/use-fetch-subject-stats';

import type { Subject, SubjectStats } from '@/interfaces/Subject';
import { Skeleton } from '@ui/skeleton';
import { Card } from '@ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@ui/button';

// TODO - Starting trimester and ending, filtrar opiniones por carrera
export function SubjectSheetBody({ subject }: { subject: Subject }) {
  const subjectStatsQuery = useFetchSubjectStats(subject.code.ID);

  return (
    <>
      <SheetHeader>
        <SheetTitle>
          {subject.name} ({subject.code.ID})
        </SheetTitle>
      </SheetHeader>

      <main className="mt-2 space-y-4">
        <section className="flex flex-wrap justify-center gap-4">
          {subject.careers.map((career) => (
            <Badge key={career.ID} className="line-clamp-1">
              {career.ID}
            </Badge>
          ))}
        </section>
        <SheetDescription></SheetDescription>

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
                  No hay estadísticas disponibles para esta materia. Añade tu opinión o espera que tus compañeros lo
                  hagan
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

      {/* REVIEW - Considerar poner acciones */}
      {/* <SheetFooter>Proximamente...</SheetFooter> */}
    </>
  );
}

const chartConfig = {
  grade: {
    label: 'Calificación',
    color: 'var(--chart-1)',
  },
  difficulty: {
    label: 'Dificultad',
    color: 'var(--chart-2)',
  },
  workload: {
    label: 'Carga de trabajo',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

function GradeChart({ data }: { data: SubjectStats[] }) {
  // const prueba = Array.from({length: 20}).map((_, i) => ({
  //   grade: Math.random() * 20,
  //   trimester: { ID: `2024-${i}` },
  // }))
  return (
    <>
      <h3 className="text-center text-balance">Promedio de notas</h3>
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="trimester.ID" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis domain={[0, 20]} tickLine={false} axisLine={false} tickMargin={8} />

          <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="grade"
            type="natural"
            fill="var(--color-grade)"
            fillOpacity={0.4}
            stroke="var(--color-grade)"
          />
        </AreaChart>
      </ChartContainer>
    </>
  );
}

function OpinionChart({ data }: { data: SubjectStats[] }) {
  return (
    <>
      <h3 className="text-center text-balance">Promedio de Opinión de los Estudiantes</h3>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="trimester.ID" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis domain={[0, 5]} tickLine={false} axisLine={false} tickMargin={8} />

          <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
          <Line
            dataKey="difficulty"
            type="natural"
            fill="var(--color-difficulty)"
            fillOpacity={0.4}
            stroke="var(--color-difficulty)"
          />
          <Line
            dataKey="workload"
            type="natural"
            fill="var(--color-workload)"
            fillOpacity={0.4}
            stroke="var(--color-workload)"
          />

          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
    </>
  );
}
