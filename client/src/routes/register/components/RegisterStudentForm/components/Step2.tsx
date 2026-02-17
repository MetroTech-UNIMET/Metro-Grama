import { useWatch } from 'react-hook-form';

import { FormCareerMultiSelectorField } from './form-field-CareerMultiDropdown';
import { RegisterStudentSchema } from '../schema';

import { useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import { FormAutocompleteField } from '@ui/derived/form-fields/form-field-autocomplete';
import { Button } from '@ui/button';

export function Step2() {
  const selectedCareers = useWatch<RegisterStudentSchema>({
    name: 'careers',
  }) as RegisterStudentSchema['careers'];
  const trimestersQuery = useFetchTrimestersOptions({
    params: {
      noFuture: true,
    }
  });

  return (
    <>
      <FormCareerMultiSelectorField name="careers" label="Carreras" className='w-full' containerClassName='w-full'/>

      {trimestersQuery.error && (
        <div className="mt-4 rounded-md bg-white">
          <div
            role="alert"
            aria-live="assertive"
            className="border-destructive/80 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
          >
            <p className="font-semibold">No se pudieron cargar los trimestres.</p>
            <p className="mt-1">
              {trimestersQuery.error instanceof Error ? trimestersQuery.error.message : 'Intenta nuevamente más tarde.'}
            </p>
            <Button type="button" onClick={() => trimestersQuery.refetch?.()} colors="destructive" className="mt-3">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      <ul className=" mt-8 space-y-4">
        {selectedCareers.map((career, index) => (
          <li key={index} className="">
            <p className="mb-2 text-xl font-bold">{career.label}</p>

            <FormAutocompleteField
              name={`startingTrimesters.${index}`}
              label="Trimestre inicial"
              options={trimestersQuery.data ?? []}
              isLoading={trimestersQuery.isLoading}
              emptyIndicator={'No hay trimestres cargados'}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
