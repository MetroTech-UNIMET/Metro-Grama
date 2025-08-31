import { useWatch } from 'react-hook-form';

import { FormCareerMultiSelectorField } from './form-field-CareerMultiDropdown';
import { RegisterStudentSchema } from '../schema';

import { useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import { FormAutocompleteField } from '@ui/derived/form-fields/form-field-autocomplete';

export function Step2() {
  const selectedCareers = useWatch<RegisterStudentSchema>({
    name: 'careers',
  }) as RegisterStudentSchema['careers'];
  const { data, isLoading, error } = useFetchTrimestersOptions();

  return (
    <>
      <FormCareerMultiSelectorField name="careers" label="Carreras" />

      <ul className="col-span-2 mt-8 space-y-4">
        {selectedCareers.map((career, index) => (
          <li key={index} className="">
            <p className="mb-2 text-xl font-bold">{career.label}</p>

            <FormAutocompleteField
              name={`startingTrimesters.${index}`}
              label="Trimestre inicial"
              options={data ?? []}
              isLoading={isLoading}
              emptyIndicator={'No hay trimestres cargados'}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
