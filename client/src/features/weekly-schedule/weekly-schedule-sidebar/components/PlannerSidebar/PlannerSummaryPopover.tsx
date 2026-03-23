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
  if (value === 0) return 'low';
  const [highThreshold, mediumThreshold] = ranges;
  if (value >= highThreshold) return 'high';
  if (value >= mediumThreshold) return 'medium';
  return 'low';
}

function invertLevel(level: DifficultyLevel): DifficultyLevel {
  if (level === 'medium') return 'medium';
  return level === 'high' ? 'low' : 'high';
}

function classForLevel(level: DifficultyLevel, label: string) {
  // For `Nota` (grade) higher values mean easier — invert color severity
  const effective = label === 'Nota' ? invertLevel(level) : level;
  return difficultyClassNames[effective];
}

function formatValue(value: number) {
  return Number.isFinite(value) ? value.toLocaleString('es-VE', { maximumFractionDigits: 2 }) : '0';
}

const Normal_Num_Subjects = 4;

const STAT_RANGES = {
  Dificultad: [4 * Normal_Num_Subjects, 3 * Normal_Num_Subjects],
  Carga: [4 * Normal_Num_Subjects, 3 * Normal_Num_Subjects],
  Nota: [15, 9],
} as const;

export function PlannerSummaryPopover() {
  const { summary, subjectEvents } = usePlannerSidebarContext();

  const hasRiskAlert = useMemo(() => {
    if (subjectEvents.length === 0) return false;

    const isHighDifficulty = getDifficulty(summary.difficultySummary?.total ?? 0, STAT_RANGES.Dificultad) === 'high';
    const isHighWorkload = getDifficulty(summary.workloadSummary?.total ?? 0, STAT_RANGES.Carga) === 'high';
    const isLowGrade = getDifficulty(summary.gradeSummary?.avg ?? 0, STAT_RANGES.Nota) === 'low';

    return isHighDifficulty || isHighWorkload || isLowGrade;
  }, [summary, subjectEvents]);

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
            {hasRiskAlert && (
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
  const [highThreshold, mediumThreshold] = ranges;

  const baseDifficulty = getDifficulty(summary?.avg ?? 0, ranges);
  const displayClass = classForLevel(baseDifficulty, label);


  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="cursor-help rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-muted-foreground text-xs">{label}</p>

            {summary !== null ? (
              <>
                <p className={cn('text-xl font-bold', displayClass)}>{formatValue(summary.avg)}</p>
                {label !== 'Nota' && (
                  <p className="text-muted-foreground text-xs">Total: {formatValue(summary?.total ?? 0)}</p>
                )}{' '}
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
                <strong className={displayClass}>
                  {difficultyLabelsByGender.feminine[baseDifficulty]}
                </strong>{' '}
                comparada con otros horarios posibles
              </p>
              <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                <p>
                  Nivel <strong className={classForLevel('low', label)}>{difficultyLabelsByGender.masculine.low}</strong>:
                  promedio &lt; {formatValue(mediumThreshold)}
                </p>
                <p>
                  Nivel{' '}
                  <strong className={classForLevel('medium', label)}>{difficultyLabelsByGender.masculine.medium}</strong>:{' '}
                  {formatValue(mediumThreshold)} ≤ promedio &lt; {formatValue(highThreshold)}
                </p>
                <p>
                  Nivel <strong className={classForLevel('high', label)}>{difficultyLabelsByGender.masculine.high}</strong>
                  : promedio ≥ {formatValue(highThreshold)}
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
