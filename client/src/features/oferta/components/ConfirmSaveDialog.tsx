import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingButton } from '@ui/derived/submit-button';

import {
  useMutationBatchUpdateOffers,
  type BatchUpdatePayload,
} from '../hooks/mutations/use-mutation-batch-update-offers';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  changes: BatchUpdatePayload['changes'];
}

export function ConfirmSaveDialog({ open, onOpenChange, changes }: Props) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const batchMutation = useMutationBatchUpdateOffers();

  const handleConfirmSave = useCallback(async () => {
    if (!executeRecaptcha) return;

    try {
      const token = await executeRecaptcha('batch_update_offers');
      await batchMutation.mutateAsync({ changes, captcha: token });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes('reCAPTCHA')) {
        toast.error('Error de verificación', {
          description: 'No se pudo verificar reCAPTCHA. Intente de nuevo.',
        });
      }
      // Mutation errors are handled by the mutation's onError
      console.error('Save failed:', error);
    }
  }, [changes, executeRecaptcha, batchMutation]);

  // Helper to format trimester ID "2324-1" -> "T1"
  const formatTrimester = (id: string) => {
    const [, suffix] = id.split('-');
    if (suffix === '1') return 'T1';
    if (suffix === '2') return 'T2';
    if (suffix === '3') return 'T3';
    if (suffix === 'INTENSIVO') return 'Intensivo';
    return suffix;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Confirmar cambios</DialogTitle>
          <DialogDescription>
            Estás seguro de querer modificar la oferta anual de las siguientes materias?
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] rounded-md border p-4">
          <ul className="space-y-3 text-sm">
            {changes.map((change) => (
              <li key={change.subjectId} className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0">
                <span className="text-foreground font-semibold">{change.subjectId}</span>
                <div className="flex flex-wrap gap-2">
                  {change.add.length > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Agrega: {change.add.map(formatTrimester).join(', ')}
                    </span>
                  )}
                  {change.remove.length > 0 && (
                    <span className="text-destructive">Elimina: {change.remove.map(formatTrimester).join(', ')}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <LoadingButton onClick={handleConfirmSave} isLoading={batchMutation.isPending} colors="primary">
            Confirmar
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
