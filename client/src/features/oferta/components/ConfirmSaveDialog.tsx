import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingButton } from '@ui/derived/submit-button';

import type { BatchUpdatePayload } from '../hooks/mutations/use-mutation-batch-update-offers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  changes: BatchUpdatePayload['changes'];
}

export function ConfirmSaveDialog({ open, onOpenChange, onConfirm, isLoading, changes }: Props) {
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
                <span className="font-semibold text-foreground">{change.subjectId}</span>
                <div className="flex flex-wrap gap-2">
                  {change.add.length > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Agrega: {change.add.map(formatTrimester).join(', ')}
                    </span>
                  )}
                  {change.remove.length > 0 && (
                    <span className="text-destructive">
                      Elimina: {change.remove.map(formatTrimester).join(', ')}
                    </span>
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

          <LoadingButton onClick={onConfirm} isLoading={isLoading} colors="primary">
            Confirmar
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
