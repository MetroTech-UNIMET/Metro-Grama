import { Info } from 'lucide-react';

import { cn } from '@utils/className';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@ui/dialog';
import { Button } from '@ui/button';
import { ElectiveForm } from './ElectiveForm';

interface Props {
  buttonClassName?: string;
}

export function ElectiveInfo({ buttonClassName }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" colors="tertiary" className={cn('shadow-md', buttonClassName)}>
          <Info className="mr-2 h-4 w-4" />
          Información Electivas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sobre las Electivas</DialogTitle>
          <DialogDescription>Información importante sobre las materias electivas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            Las materias electivas son fundamentales para complementar tu formación académica. Puedes elegir entre una
            variedad de opciones según tus intereses.
          </p>
          <p>Recuerda revisar los requisitos de créditos electivos para tu carrera.</p>
        </div>

        <ElectiveForm />
      </DialogContent>
    </Dialog>
  );
}
