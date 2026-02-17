import { useMemo } from 'react';

import { cn } from '@utils/className';
import { idToSurrealId } from '@utils/queries';

import { useFetchStudentCareers } from '@/hooks/queries/student/use-fetch-student-careers';
import { type CareerOption, useFetchCareersOptions } from '@/hooks/queries/career/use-fetch-careers';

import MultipleSelector, { type MultipleSelectorProps } from '@ui/derived/multidropdown';
import { Spinner } from '@ui/spinner';

import type { Career } from '@/interfaces/Career';
import type { Option } from '@ui/types/option.types';

interface Props extends Omit<MultipleSelectorProps<`career:${string}`, Career>, 'options' | 'onChange' | 'value'> {
  loadingSubjects?: boolean;
  maxSelected?: number;
  value?: CareerOption[];
  onChange?: (value: CareerOption[]) => void;
}

export function CareerMultiDropdown({
  loadingSubjects = false,
  value,
  onChange,
  maxSelected = 3,
  className,
  placeholder,
  ...props
}: Props) {
  const { data: options, isLoading, error } = useFetchCareersOptions();
  const studentCareerQuery = useFetchStudentCareers();

  const groupedOptions = useMemo(() => {
    if (!studentCareerQuery.data) return options;

    const studentCareersSet = new Set(studentCareerQuery.data.map(({ Table, ID }) => idToSurrealId(ID, Table)));

    const enrolledOptions = options
      .filter((option) => studentCareersSet.has(option.value))
      .map((option) => ({
        ...option,
        enrolled: 'Mis carreras',
      }));
    const otherOptions = options
      .filter((option) => !studentCareersSet.has(option.value))
      .map((option) => ({
        ...option,
        enrolled: 'Otras carreras',
      }));

    return [...enrolledOptions, ...otherOptions];
  }, [options, studentCareerQuery.data]);

  return (
    <MultipleSelector
      value={value}
      onChange={onChange as (value: Option<`career:${string}`, Career>[]) => void}
      options={groupedOptions}
      groupBy="enrolled"
      maxSelected={maxSelected}
      placeholder={
        value?.length === maxSelected
          ? 'Máximo alcanzado'
          : (placeholder ?? 'Selecciona las carreras que deseas visualizar')
      }
      showSpinner={loadingSubjects}
      emptyIndicator={
        isLoading && !error ? (
          <span className="grid place-items-center">
            <Spinner />
          </span>
        ) : (
          <p>
            {options.length === 0 || error
              ? ' No se encontraron carreras. Por favor, intenta más tarde o recarga la página.'
              : 'No hay más carreras para seleccionar.'}
          </p>
        )
      }
      inputProps={{
        className: 'w-auto',
      }}
      badgeClassName="bg-blue-200 hover:bg-blue-300 text-black"
      className={cn('bg-gray-200', className)}
      {...props}
    />
  );
}
