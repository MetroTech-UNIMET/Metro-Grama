import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOfferForSubject, deleteSubjectOffer } from '@/api/subject_offferAPI';
import { toast } from 'sonner';
import { SubjectEntity } from '@/interfaces/Subject';

type CreateOfferForSubjectArgs = Parameters<typeof createOfferForSubject>;
type DeleteSubjectOfferArgs = Parameters<typeof deleteSubjectOffer>;

export function useMutationCreateOfferForSubject(subject: SubjectEntity) {
  const queryClient = useQueryClient();

  const createOfferMutation = useMutation({
    mutationKey: ['create-offer-for-subject', subject.id],
    mutationFn: async ({ trimesterId }: { trimesterId: CreateOfferForSubjectArgs[1] }) => {
      return createOfferForSubject(subject.id.ID, trimesterId);
    },
    onSuccess: (_, { trimesterId }) => {
      queryClient.invalidateQueries({ queryKey: ['subjects', 'offer'] });
      toast.success(
        <div>
          Oferta <strong>creada </strong> exitosamente para la materia <strong>{subject.name}</strong> en el trimestre{' '}
          <strong>{trimesterId.ID}</strong>
        </div>,
      );
    },
    onError: (error) => {
      toast.error('Error al crear la oferta', {
        description: error.message,
      });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationKey: ['delete-offer-for-subject', subject.id],
    mutationFn: async ({ trimesterId }: { trimesterId: DeleteSubjectOfferArgs[1] }) => {
      return deleteSubjectOffer(subject.id.ID, trimesterId);
    },
    onSuccess: (_, { trimesterId }) => {
      queryClient.invalidateQueries({ queryKey: ['subjects', 'offer'] });
      toast.success(
        <div>
          Oferta <strong>eliminada</strong> exitosamente para la materia <strong>{subject.name}</strong> en el trimestre{' '}
          <strong>{trimesterId.ID}</strong>
        </div>,
      );
    },
    onError: (error) => {
      toast.error('Error al eliminar la oferta', {
        description: error.message,
      });
    },
  });

  return { createOfferMutation, deleteOfferMutation };
}
