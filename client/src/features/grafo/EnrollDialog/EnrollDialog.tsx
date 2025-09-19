import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { defaultEnrollDialogValues, type EnrollDialogOutput, enrollDialogSchema } from './schema';

import { TrimesterOption, useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import { FormInputNumberField } from '@ui/derived/form-fields/form-field-number';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { FormAutocompleteField } from '@ui/derived/form-fields/form-field-autocomplete';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import { Form } from '@ui/form';
import { onInvalidToast } from '@utils/forms';

import type { Subject } from '@/interfaces/Subject';

interface Props {
  selectedSubjectDialog: Subject | null;
}

export default function EnrollDialog({ selectedSubjectDialog }: Props) {
  const form = useForm({
    resolver: zodResolver(enrollDialogSchema),
    defaultValues: defaultEnrollDialogValues,
  });

  const trimesterQuery = useFetchTrimestersOptions({params: { noFuture: true }});
  const [selectedTrimester, setSelectedTrimester] = useState<TrimesterOption | undefined>(undefined);

  function onSubmit(data: EnrollDialogOutput) {
    console.log(data);
  }

  if (!selectedSubjectDialog) return null;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Marcar materia: <u>{selectedSubjectDialog.name}</u>
        </DialogTitle>
        <DialogDescription>
          Introduce la nota que obtuviste en la materia y el trimestre en que la cursaste.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalidToast)} className="space-y-4">
          <FormInputNumberField name="grade" label="Nota" min={0} max={20} />

          <FormAutocompleteField
            name="trimester"
            label="Trimestre"
            placeholder="Selecciona el trimestre en el que cursaste la materia"
            options={trimesterQuery.data ?? []}
            value={selectedTrimester}
            onSelect={setSelectedTrimester}
            emptyIndicator={'No se encontraron trimestres'}
            isLoading={trimesterQuery.isLoading}
            CustomSelectItem={TrimesterItem}
            isOptionDisabled={(option) => !(option.data?.is_current || option.data?.is_next)}
          />
        </form>
      </Form>
    </DialogContent>
  );
}
