import { CartesianGrid, XAxis, YAxis, Area, Line, LineChart, AreaChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@ui/chart';

import type { SubjectStats } from '@/interfaces/Subject';

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

export function GradeChart({ data }: { data: SubjectStats[] }) {
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

export function OpinionChart({ data }: { data: SubjectStats[] }) {
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
