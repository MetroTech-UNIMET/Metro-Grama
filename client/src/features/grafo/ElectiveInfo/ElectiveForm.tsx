import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { electiveDefaultValues, ElectiveFormOutput, electiveFormSchema, type ElectiveFormInput } from './schema';

import { createSubjectElective } from '@/api/subjectsAPI';
import { useSubjectOptions } from '@/hooks/queries/subject/use-subject-options';

import SubmitButton from '@ui/derived/submit-button';
import { FormInputField } from '@/components/ui/derived/form-fields/form-field-input';
import { FormMultipleSelectorField } from '@ui/derived/form-fields/form-field-multiselect';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@ui/skeleton';

export function ElectiveForm() {
  const form = useForm({
    resolver: zodResolver(electiveFormSchema),
    defaultValues: electiveDefaultValues,
  });

  const subjectQuery = useSubjectOptions();

  async function onSubmit(data: ElectiveFormOutput) {
    try {
      await createSubjectElective(data);
      toast.success('Materia electiva creada correctamente');
      form.reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInputField<ElectiveFormInput> name="name" label="Nombre" placeholder="Ingrese el nombre de la materia" />
        <FormInputField<ElectiveFormInput> name="code" label="Código" placeholder="Ingrese el código de la materia" />

        <FormMultipleSelectorField
          name="prelations"
          label="Prelaciones"
          options={subjectQuery.data}
          placeholder="Escoje las prelaciones "
          isLoading={subjectQuery.isLoading}
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              No se encontraron materias.
            </p>
          }
          loadingIndicator={
            <div className="p-1">
              <Skeleton className="h-8 w-full" />
            </div>
          }
          containerClassName="w-full mt-auto"
          maxSelected={3}
        />
        <SubmitButton colors="primary" className="ml-auto">
          Guardar
        </SubmitButton>
      </form>
    </Form>
  );
}
