import { BarChart3, XIcon } from 'lucide-react';
import { useMemo } from 'react';

import { Summary, usePlannerSidebarContext } from '../../context/PlannerSidebarContext';

import { cn } from '@utils/className';

import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Button } from '@ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@ui/tooltip';

const difficultyClassNames = {
  low: 'text-success',
  medium: 'text-amber-600',
  high: 'text-destructive',
};

type DifficultyLevel = keyof typeof difficultyClassNames;

const difficultyLabelsByGender: Record<'feminine' | 'masculine', Record<DifficultyLevel, string>> = {
  feminine: {
    low: 'baja',
    medium: 'media',
    high: 'alta',
  },
  masculine: {
    low: 'bajo',
    medium: 'medio',
    high: 'alto',
  },
};

function getDifficulty(value: number, ranges: readonly [number, number]): DifficultyLevel {
  if (value >= ranges[0]) return 'low';
  if (value >= ranges[1]) return 'medium';
  return 'high';
}

function formatValue(value: number) {
  return Number.isFinite(value) ? value.toLocaleString('es-VE', { maximumFractionDigits: 2 }) : '0';
}

const STAT_RANGES = {
  Dificultad: [4, 3],
  Carga: [4, 3],
  Nota: [14, 9],
} as const;

export function PlannerSummaryPopover() {
  const { summary, subjectEvents } = usePlannerSidebarContext();
  const hasAnyHighStat = useMemo(() => {
    return (
      subjectEvents.length > 0 &&
      (getDifficulty(summary.difficultySummary?.avg ?? 0, STAT_RANGES.Dificultad) === 'high' ||
        getDifficulty(summary.workloadSummary?.avg ?? 0, STAT_RANGES.Carga) === 'high' ||
        getDifficulty(summary.gradeSummary?.avg ?? 0, STAT_RANGES.Nota) === 'high')
    );
  }, [summary]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild className="pointer-events-none fixed right-3 z-50 max-sm:top-6 sm:right-6 sm:bottom-6">
          <Button
            colors="primary"
            className="pointer-events-auto h-11 rounded-xl px-4 shadow-md"
            disabled={subjectEvents.length === 0}
            aria-label="Ver resumen del horario"
          >
            {hasAnyHighStat && (
              <span className="absolute -top-0.5 -left-0.5 z-10 flex size-3" aria-hidden="true">
                <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"></span>
                <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
              </span>
            )}
            <BarChart3 className="size-4" />
            <span className="text-sm font-semibold max-md:sr-only">Resumen</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="top"
          className="pointer-events-auto relative w-[min(92vw,24rem)] space-y-4 rounded-xl p-4"
        >
          <PopoverClose className="text-muted-foreground absolute top-2 right-2 cursor-pointer rounded-full p-1 hover:bg-neutral-200/50 active:bg-neutral-300/60">
            <XIcon className="size-4" />
          </PopoverClose>

          <div className="space-y-1">
            <h4 className="text-base font-semibold">Resumen del horario</h4>
            <p className="text-muted-foreground text-xs">Promedios y totales de las materias seleccionadas.</p>
            <p className="text-muted-foreground text-xs">
              La alerta se determina por rangos usando el promedio calculado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SubjectStat label="Dificultad" summary={summary.difficultySummary} />
            <SubjectStat
              label="Carga"
              summary={summary.workloadSummary}
              // summary={{
              //   total: 4,
              //   avg: 3,
              // }}
            />
            <SubjectStat
              label="Nota"
              summary={summary.gradeSummary}
              // summary={{
              //   total: 15,
              //   avg: 15,
              // }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

function SubjectStat({ label, summary }: { label: string; summary: Summary }) {
  const ranges = STAT_RANGES[label as keyof typeof STAT_RANGES];
  const [lowMin, mediumMin] = ranges;

  const difficulty = getDifficulty(summary?.avg ?? 0, ranges);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="cursor-help rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-muted-foreground text-xs">{label}</p>

            {summary !== null ? (
              <>
                <p className={cn('text-xl font-bold', difficultyClassNames[difficulty])}>{formatValue(summary.avg)}</p>
                <p className="text-muted-foreground text-xs">Total: {formatValue(summary?.total ?? 0)}</p>
              </>
            ) : (
              <span className="text-muted-foreground text-lg font-bold">-</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-background max-w-50 text-center text-black">
          {summary !== null ? (
            <>
              <p>
                Este horario tiene una <span className="font-medium lowercase">{label}</span>{' '}
                <strong className={difficultyClassNames[difficulty]}>
                  {difficultyLabelsByGender.feminine[difficulty]}
                </strong>{' '}
                comparada con otros horarios posibles
              </p>
              <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                <p>
                  Nivel <strong className={difficultyClassNames.low}>{difficultyLabelsByGender.masculine.low}</strong>:
                  promedio ≥ {formatValue(lowMin)}
                </p>
                <p>
                  Nivel{' '}
                  <strong className={difficultyClassNames.medium}>{difficultyLabelsByGender.masculine.medium}</strong>:{' '}
                  {formatValue(mediumMin)} ≤ promedio &lt; {formatValue(lowMin)}
                </p>
                <p>
                  Nivel <strong className={difficultyClassNames.high}>{difficultyLabelsByGender.masculine.high}</strong>
                  : promedio &lt; {formatValue(mediumMin)}
                </p>
              </div>
            </>
          ) : (
            <>
              <p>No se han seleccionado materias con datos de promedio para calcular el resumen.</p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
