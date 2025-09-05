import { useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronDown, Save } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import z from 'zod/v4';

import { courseSchema } from './schema';

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

import type { SubjectEvent } from '..';

export function SaveScheduleButton() {
  const { events } = useWeeklyPlannerContext<SubjectEvent>();

  const navigate = useNavigate();
  const search = useSearch({ from: '/horario/' });

  const { user } = useAuth();

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
    <ButtonGroup
      className={cn(
        'mt-16 w-full text-lg',
        // 'absolute top-10 right-1/2 z-20 w-56 translate-x-1/2',
      )}
    >
      <Button
        colors="primary"
        className="w-full py-8"
        disabled={events.length === 0}
        onClick={() => saveSchedules(true)}
      >
        <Save className="!size-6" />
        Guardar horario
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="rounded-l-none">
          <Button colors="primary" className="min-w-10 border-l border-slate-100 py-8">
            <ChevronDown className="!size-6" />
            <span className="sr-only">Abrir opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" sideOffset={4} align="end" className="max-w-64 md:max-w-xs!">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => saveSchedules(false)}>
              <Save />
              Guardar horario secundario
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Escoger horarios</DropdownMenuLabel>

          <DropdownMenuRadioGroup
            value={search.is_principal ? 'principal' : 'secundario'}
            onValueChange={(value) => chooseScheduleToView(value === 'principal')}
          >
            <DropdownMenuRadioItem value="principal">Visualizar horario principal</DropdownMenuRadioItem>

            <DropdownMenuRadioItem value="secundario">Visualizar horario secundario</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
