import { cn } from '@utils/className';

import useFetchCareersOptions, { type CareerOption } from '@/hooks/queries/use-FetchCareersOptions';

import MultipleSelector, { type MultipleSelectorProps } from '@ui/derived/multidropdown';
import { Spinner } from '@ui/spinner';

import type { Career } from '@/interfaces/Career';

interface Props extends Omit<MultipleSelectorProps<`career:${string}`, Career>, 'options'> {
  loadingSubjects?: boolean;
  maxSelected?: number;
}

// FIXME - Width del input no se ajusta al tamaño cuando hay una sola badge
export function CareerMultiDropdown({
  loadingSubjects = false,
  value,
  onChange,
  maxSelected = 3,
  className,
  placeholder,
  ...props
}: Props) {
  const { options, isLoading, error } = useFetchCareersOptions();

  value;
  return (
    <div className="relative w-full max-w-sm">
      <MultipleSelector
        value={value}
        onChange={onChange as (value: CareerOption[]) => void}
        options={options}
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
    </div>
  );
}
