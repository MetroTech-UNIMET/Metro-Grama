import { useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronDown, Save } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import z from 'zod/v4';

import { courseSchema } from './schema';

import { useFetchStudentCourseByTrimester } from '@/hooks/queries/course/use-fetch-student-course-by-trimester';

import { useWeeklyPlannerContext } from '@/features/weekly-schedule/weekly-planner/context';

import { createSchedule } from '@/api/interactions/courseApi';
import { useAuth } from '@/contexts/AuthenticationContext';

import { cn } from '@utils/className';
import { isStudentUser } from '@/interfaces/User';

import { ButtonGroup } from '@ui/derived/button-group';
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

export function SaveScheduleButton() {
  const { events, overlappingEventIds } = useWeeklyPlannerContext<SubjectEvent>();
  const hasOverlaps = overlappingEventIds.size > 0;

  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const { user } = useAuth();

  const trimesterId = search.trimester !== 'none' ? search.trimester : '';
  const isPrincipal = search.is_principal;
  const { isFetching } = useFetchStudentCourseByTrimester({
    trimesterId,
    params: { is_principal: isPrincipal },
    queryOptions: { enabled: !!trimesterId },
  });

  async function saveSchedules(isPrincipal: boolean) {
    if (!user) throw new Error('User is not authenticated');
    if (!isStudentUser(user)) throw new Error('User is not a student');

    const subjectEvents = events.map((event) => event.data);

    const resultParsed = courseSchema.safeParse({
      studentId: user.student.id,
      subjectEvents,
      trimesterId: subjectEvents[0].trimesterId,
      is_principal: isPrincipal,
    });

    if (!resultParsed.success) {
      toast.error('Error al guardar el horario', {
        description: z.prettifyError(resultParsed.error),
      });
      return;
    }

    try {
      await createSchedule(resultParsed.data);
      toast.success('Horario guardado con éxito!', {
        description: `El horario se ha guardado como ${isPrincipal ? 'principal' : 'secundario'}.`,
      });
    } catch (error: any) {
      console.log(error);
      toast.error('Error al guardar el horario', {
        description: isAxiosError(error) ? error.response?.data?.message : error.message,
      });
    }
  }

  function chooseScheduleToView(principal: boolean) {
    navigate({
      to: '/horario',
      search: { ...search, is_principal: principal },
      replace: true,
    });
  }

  return (
    <div className={cn('fixed right-1/2 bottom-10 z-20 flex w-full translate-x-1/2 flex-col items-center gap-2')}>
      <ButtonGroup className={cn('w-full max-w-80 text-lg')}>
        <Button
          colors="primary"
          className="w-full py-8"
          disabled={events.length === 0 || hasOverlaps}
          onClick={() => saveSchedules(true)}
          title={hasOverlaps ? 'No puedes guardar mientras existan materias que se solapan' : undefined}
        >
          <Save className="!size-6" />
          Guardar horario
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="rounded-l-none">
            <Button
              colors="primary"
              className="min-w-10 border-l border-slate-100 py-8"
              title={hasOverlaps ? 'No disponible por materias solapadas' : undefined}
            >
              <ChevronDown className="!size-6" />
              <span className="sr-only">Abrir opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" sideOffset={4} align="end" className="max-w-64 md:max-w-xs!">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => saveSchedules(false)} disabled={events.length === 0 || hasOverlaps}>
                <Save />
                Guardar horario secundario
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
