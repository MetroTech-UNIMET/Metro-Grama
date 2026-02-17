import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleQuestionMarkIcon } from 'lucide-react';

import { defaultEnrollDialogValues, type EnrollDialogOutput, enrollDialogSchema } from './schema';
import { maxScaleNumber, minScaleNumber } from './constants';
import { useMutationEnrollSubject } from './hooks/mutations/use-enroll-mutation';

import { useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import { onInvalidToast } from '@utils/forms';

import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { FormInputNumberField } from '@ui/derived/form-fields/form-field-number';
import { FormRadioRangeField } from '@ui/derived/form-fields/form-field-radio-range';
import { FormAutocompleteField } from '@ui/derived/form-fields/form-field-autocomplete';

import SubmitButton from '@ui/derived/submit-button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/dialog';
import { Form } from '@ui/form';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { Button } from '@ui/button';

import type { SubjectNode } from '../behaviors/MenuActions';

interface Props {
  selectedSubjectNode: SubjectNode | null;
  afterSubmit: () => void;
}

export default function EnrollDialog({ selectedSubjectNode, afterSubmit }: Props) {
  const [dialogRef, setDialogRef] = useState<HTMLDivElement | null>(null);
  const subject = selectedSubjectNode?._cfg?.model?.data.data;

  const form = useForm({
    resolver: zodResolver(enrollDialogSchema),
    defaultValues: defaultEnrollDialogValues,
  });

  const trimesterQuery = useFetchTrimestersOptions({ params: { noFuture: true } });

  const mutationEnrollSubject = useMutationEnrollSubject({
    subject: selectedSubjectNode,
    afterSubmit: () => {
      afterSubmit();
      form.reset();
    },
  });

  if (!subject) return null;

  function onSubmit(data: EnrollDialogOutput) {
    mutationEnrollSubject.mutate({ data });
  }

  return (
    <DialogContent ref={setDialogRef}>
      <DialogHeader>
        <DialogTitle>
          Marcar materia: <u>{subject.name}</u>
        </DialogTitle>
        <DialogDescription>
          Introduce la nota que obtuviste en la materia y el trimestre en que la cursaste.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalidToast)} className="space-y-4">
          <FormInputNumberField name="grade" label="Nota" min={0} max={20} />

          <FormAutocompleteField
            name="trimesterId"
            label="Trimestre"
            placeholder="Selecciona el trimestre en el que cursaste la materia"
            options={trimesterQuery.data ?? []}
            emptyIndicator={'No se encontraron trimestres'}
            isLoading={trimesterQuery.isLoading}
            CustomSelectItem={TrimesterItem}
            saveAsOption
            popoverContainer={dialogRef ?? undefined}
          />

          <FormRadioRangeField
            name="difficulty"
            label="Dificultad"
            min={minScaleNumber}
            max={maxScaleNumber}
            labelClassName="flex items-center mb-0"
            descriptionLabel={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" className="w-">
                    <CircleQuestionMarkIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  Qué tan difícil te pareció la materia en cuanto a contenido, exámenes, proyectos, etc.
                </TooltipContent>
              </Tooltip>
            }
            radioLabels={['Baja', undefined, 'Media', undefined, 'Alta']}
          />

          <FormRadioRangeField
            name="workload"
            label="Carga de trabajo"
            min={minScaleNumber}
            max={maxScaleNumber}
            radioLabels={['Baja', undefined, 'Media', undefined, 'Alta']}
            labelClassName="flex items-center mb-0"
            descriptionLabel={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" className="w-">
                    <CircleQuestionMarkIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  Qué tanta carga de trabajo (horas de estudio, trabajos, proyectos, etc.) te generó la materia.
                </TooltipContent>
              </Tooltip>
            }
          />

          {/* <FormRadioRangeField
            name="effort"
            label="Esfuerzo"
            min={0}
            max={10}
            radioLabels={['Bajo', 'Medio', 'Alto ']}
          /> */}
          <DialogFooter>
            <SubmitButton disabled={trimesterQuery.isLoading} colors={'primary'}>
              Guardar
            </SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
