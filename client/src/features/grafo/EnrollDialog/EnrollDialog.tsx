import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleQuestionMarkIcon } from 'lucide-react';

import {
  defaultEnrollDialogValues,
  type EnrollDialogInput,
  type EnrollDialogOutput,
  enrollDialogSchema,
} from './schema';
import { maxScaleNumber, minScaleNumber } from './constants';
import { useMutationEnrollSubject } from './hooks/mutations/use-enroll-mutation';
import { useMutationUpdateEnrollSubject } from './hooks/mutations/use-update-enroll-mutation';
import { useFetchEnrollment } from './hooks/queries/use-fetch-enrollment';

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
import { Spinner } from '@ui/spinner';
import { ScrollArea } from '@ui/scroll-area';

import type { Subject } from '@/interfaces/Subject';

interface Props {
  subject: Subject | null;
  isEditMode: boolean;
  initialValues?: Partial<Omit<EnrollDialogInput, 'trimesterId'>> & { trimesterId?: string };
  afterSubmit: (data: EnrollDialogOutput) => void;
}

export default function EnrollDialog({ subject, isEditMode, initialValues, afterSubmit }: Props) {
  const [dialogRef, setDialogRef] = useState<HTMLDivElement | null>(null);

  const subjectCode = subject?.code.ID;

  const shouldFetchEnrollment = isEditMode && !initialValues;

  const form = useForm({
    resolver: zodResolver(enrollDialogSchema),
    defaultValues: defaultEnrollDialogValues,
  });

  const trimesterQuery = useFetchTrimestersOptions({ params: { noFuture: true } });

  const enrollmentQuery = useFetchEnrollment({
    subjectCode,
    queryOptions: { enabled: shouldFetchEnrollment },
  });

  useEffect(() => {
    if (!subject) return;
    const trimesterOptions = trimesterQuery.data;

    if (!isEditMode) {
      form.reset(defaultEnrollDialogValues);
      return;
    }

    if (initialValues && trimesterOptions) {
      const trimesterOption = initialValues.trimesterId
        ? trimesterOptions.find((option) => option.value === initialValues.trimesterId)
        : undefined;
      if (!trimesterOption) return;

      form.reset({
        grade: initialValues.grade ?? defaultEnrollDialogValues.grade,
        trimesterId: trimesterOption,
        difficulty: initialValues.difficulty ?? defaultEnrollDialogValues.difficulty,
        workload: initialValues.workload ?? defaultEnrollDialogValues.workload,
      });
      return;
    }

    if (enrollmentQuery.data && trimesterOptions) {
      const enrollment = enrollmentQuery.data;

      const trimesterOption = trimesterOptions.find((option) => option.value === enrollment.trimester.ID);
      if (!trimesterOption) return;

      form.reset({
        grade: enrollment.grade,
        trimesterId: trimesterOption,
        difficulty: enrollment.difficulty ?? undefined,
        workload: enrollment.workload ?? undefined,
      });
    }
  }, [isEditMode, enrollmentQuery.data, form, initialValues, subject, trimesterQuery.data]);

  const mutationEnrollSubject = useMutationEnrollSubject({
    subjectCode,
    afterSubmit: (data) => {
      form.reset();
      afterSubmit(data);
    },
  });

  const mutationUpdateEnrollSubject = useMutationUpdateEnrollSubject({
    subjectCode,
    afterSubmit: (data) => {
      form.reset();
      afterSubmit(data);
    },
    originalTrimester: initialValues?.trimesterId
  });

  if (!subject) return null;

  async function onSubmit(data: EnrollDialogOutput) {
    if (isEditMode) {
      await mutationUpdateEnrollSubject.mutateAsync({ data });
    } else {
      await mutationEnrollSubject.mutateAsync({ data });
    }
  }

  const isLoading = shouldFetchEnrollment && enrollmentQuery.isLoading;

  return (
    <DialogContent ref={setDialogRef} className="p-0">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle>
          {isEditMode ? 'Editar materia: ' : 'Marcar materia: '}
          <u className="underline-offset-4">{subject.name}</u>
        </DialogTitle>
        <DialogDescription>
          Introduce la nota que obtuviste en la materia y el trimestre en que la cursaste.
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Form {...form}>
          <ScrollArea className="max-sm:h-94 max-[30rem]:h-80">
            <form id="enroll-form" onSubmit={form.handleSubmit(onSubmit, onInvalidToast)} className="space-y-4 px-6">
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
                      <Button type="button" size="icon" variant="ghost" className="ml-2">
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
                      <Button type="button" size="icon" variant="ghost" className="ml-2">
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
            </form>
          </ScrollArea>

          <DialogFooter className="p-6 pt-0">
            <SubmitButton form="enroll-form" disabled={trimesterQuery.isLoading} colors={'primary'}>
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </SubmitButton>
          </DialogFooter>
        </Form>
      )}
    </DialogContent>
  );
}
