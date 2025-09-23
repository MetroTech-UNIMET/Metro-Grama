import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { uploadAnnualOfferPDF } from '@/api/subject_offferAPI';

export function useMutationUploadAnnualOfferPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['upload-annual-offer-pdf'],
    mutationFn: async ({ file }: { file: File }) => {
      return uploadAnnualOfferPDF(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', 'offer'] });

      toast.success('PDF subido y procesado correctamente.');
    },
    onError: (error: any) => {
      const description = error?.response?.data?.message || error?.message || 'Error desconocido';
      toast.error('Error al subir el PDF', { description });
    },
  });
}
