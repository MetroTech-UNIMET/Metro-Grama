import { useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronDown, Save } from 'lucide-react';
import { useRef } from 'react';

import { useFetchStudentCourseByTrimester } from '@/hooks/queries/course/use-fetch-student-course-by-trimester';

import { useWeeklyPlannerContext } from '@/features/weekly-schedule/weekly-planner/context';
import { useAuth } from '@/contexts/AuthenticationContext';
import { useMutationSaveSchedule } from '../hooks/mutations/use-save-schedule-mutation';

import { cn } from '@utils/className';

import { ButtonGroup, ButtonGroupSeparator } from '@ui/button-group';
import { Button } from '@ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@ui/dropdown-menu';
import { Spinner } from '@ui/spinner';

import type { SubjectEvent } from '..';
import { useHotkeyClick } from '@/hooks/use-hotkey-action';

// TODO Añadir opción para ver resumen: Materias nuevas que abren, puntos de dificultad, carga academica, etc
export function SaveScheduleButton() {
  const { events, overlappingEventIds } = useWeeklyPlannerContext<SubjectEvent>();
  const hasOverlaps = overlappingEventIds.size > 0;
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);

  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const { user } = useAuth();
  const saveScheduleMutation = useMutationSaveSchedule();

  const trimesterId = search.trimester !== 'none' ? search.trimester : '';
  const isPrincipal = search.is_principal;
  const { isFetching } = useFetchStudentCourseByTrimester({
    trimesterId,
    params: { is_principal: isPrincipal },
    queryOptions: { enabled: !!trimesterId },
  });

  function chooseScheduleToView(principal: boolean) {
    navigate({
      to: '/horario',
      search: { ...search, is_principal: principal },
      replace: true,
    });
  }

  useHotkeyClick({
    hotkey: 'Mod+S',
    targetRef: saveButtonRef,
    beforeAction: () => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return false;
    },
  });

  return (
    <div className={cn('fixed right-1/2 bottom-10 z-20 flex w-full translate-x-1/2 flex-col items-center gap-2')}>
      <ButtonGroup className={cn('w-full max-w-80 text-lg')}>
        <Button
          ref={saveButtonRef}
          colors="primary"
          className="w-full py-8"
          disabled={events.length === 0 || hasOverlaps}
          onClick={() => saveScheduleMutation.mutate({ user, events, isPrincipal })}
          title={hasOverlaps ? 'No puedes guardar mientras existan materias que se solapan' : undefined}
        >
          <Save className="size-6!" />
          Guardar horario
        </Button>

        <ButtonGroupSeparator />

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="rounded-l-none">
            <Button
              colors="primary"
              className="min-w-10 border-l border-slate-100 py-8"
              title={hasOverlaps ? 'No disponible por materias solapadas' : undefined}
            >
              <ChevronDown className="size-6!" />
              <span className="sr-only">Abrir opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" sideOffset={4} align="end" className="max-w-64 md:max-w-xs!">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => saveScheduleMutation.mutate({ user, events, isPrincipal: true })}
                disabled={events.length === 0 || hasOverlaps}
              >
                <Save />
                Guardar como principal
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => saveScheduleMutation.mutate({ user, events, isPrincipal: false })}
                disabled={events.length === 0 || hasOverlaps}
              >
                <Save />
                Guardar como secundario
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Escoger horarios</DropdownMenuLabel>

            <DropdownMenuRadioGroup
              value={isPrincipal ? 'principal' : 'secundario'}
              onValueChange={(value) => chooseScheduleToView(value === 'principal')}
            >
              <DropdownMenuRadioItem
                value="principal"
                customIcon={isPrincipal && isFetching ? CustomSpinner : undefined}
              >
                Visualizar horario principal
              </DropdownMenuRadioItem>

              <DropdownMenuRadioItem
                value="secundario"
                customIcon={!isPrincipal && isFetching ? CustomSpinner : undefined}
              >
                Visualizar horario secundario
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      {hasOverlaps && (
        <span className="text-destructive max-w-80 text-center text-xs font-medium">
          No puedes guardar: existen materias que se solapan. Ajusta tu horario para continuar.
        </span>
      )}
    </div>
  );
}

const CustomSpinner = () => <Spinner className="size-4" />;
