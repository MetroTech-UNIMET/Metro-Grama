import z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

import { batchUpdateSubjectOffers } from '@/api/subject_offferAPI';

export const batchUpdatePayloadSchema = z.object({
  changes: z
    .array(
      z
        .object({
          subjectId: z.string().length(7, 'El ID de la materia debe tener exactamente 7 caracteres'),
          add: z.array(z.string()),
          remove: z.array(z.string()),
        })
        .refine((change) => change.add.length > 0 || change.remove.length > 0, {
          message: 'Cada cambio debe tener al menos una adición o eliminación',
        }),
    )
    .min(1, 'Debe haber al menos un cambio'),
  captcha: z.string(),
});

export type BatchUpdatePayload = z.infer<typeof batchUpdatePayloadSchema>;

export const useMutationBatchUpdateOffers = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: BatchUpdatePayload) => {
      const result = batchUpdatePayloadSchema.safeParse(payload);
      if (!result.success) throw new Error(z.prettifyError(result.error));

      return batchUpdateSubjectOffers(payload);
    },
    onSuccess: () => {
      toast.success('Oferta actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['subjects', 'offer', 'year'] });

      navigate({ to: '/oferta' });
    },
    onError: (error: any) => {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Error al actualizar oferta';
      toast.error(msg);
    },
  });
};
