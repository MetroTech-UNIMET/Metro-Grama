import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import z from 'zod/v4';

import { courseSchema } from '../../components/schema';

import { createSchedule } from '@/api/interactions/courseApi';
import { isStudentUser } from '@/interfaces/User';
import { mutationKeys, queryKeys } from '@/lib/query-keys';

import type { SubjectEvent } from '../../';
import type { UserType } from '@/hooks/queries/student/use-fetch-my-user';
import type { Event } from '@/features/weekly-schedule/weekly-planner/types';

interface MutationVariables {
  user: UserType | null;
  events: Event<SubjectEvent>[];
  isPrincipal: boolean;
}

export function useMutationSaveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.schedule.save,
    mutationFn: async ({ user, events, isPrincipal }: MutationVariables) => {
      if (!user) throw new Error('User is not authenticated');
      if (!isStudentUser(user)) throw new Error('User is not a student');

      const subjectEvents = events.map((event) => event.data);
      const firstEvent = subjectEvents[0];

      if (!firstEvent) throw new Error('Debes seleccionar al menos una materia');

      const resultParsed = courseSchema.safeParse({
        studentId: user.student.id,
        subjectEvents,
        trimesterId: firstEvent.trimesterId,
        is_principal: isPrincipal,
      });

      if (!resultParsed.success) throw new Error(z.prettifyError(resultParsed.error));

      return createSchedule(resultParsed.data);
    },
    onSuccess: async (_result, { isPrincipal }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.details('my-id').queryKey, refetchType: 'all' });

      toast.success('Horario guardado con éxito!', {
        description: `El horario se ha guardado como ${isPrincipal ? 'principal' : 'secundario'}.`,
      });
    },
    onError: (error) => {
      toast.error('Error al guardar el horario', {
        description: isAxiosError(error) ? error.response?.data?.message : error.message,
      });
    },
  });
}
