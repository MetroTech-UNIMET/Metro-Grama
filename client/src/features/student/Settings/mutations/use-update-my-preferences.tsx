import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { updateMyStudentPreferences } from '@/api/preferences/studentPreferencesApi';

import type { StudentPreferencesEntity } from '@/interfaces/preferences/StudentPreferences';

export function useMutationUpdateMyPreferences() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ['student_preferences', 'update'],
    mutationFn: (data: any) => updateMyStudentPreferences(data),
    onSuccess: (updated) => {
      queryClient.setQueryData<StudentPreferencesEntity | undefined>(
        ['student_preferences', 'mine'],
        (old) => updated ?? old,
      );
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const goProfile = () => {
        if (timeoutId) clearTimeout(timeoutId);
        navigate({ to: '/profile' });
      };

      toast.success('Tus preferencias se han actualizado exitosamente', {
        description: 'Serás redirigido en 3 segundos a tu perfil',
        action: {
          label: 'Ir al perfil',
          onClick: goProfile,
        },
      });

      timeoutId = setTimeout(goProfile, 3000);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar las preferencias', {
        description: error?.message ?? 'Inténtalo de nuevo',
      });
    },
  });
}
