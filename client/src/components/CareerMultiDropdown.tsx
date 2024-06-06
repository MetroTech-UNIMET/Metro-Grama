import MultipleSelector, { Option } from "@ui/derived/multidropdown";
import { Spinner } from "@ui/spinner";
import useFetchCareersOptions, {
  CareerOption,
} from "@/hooks/use-FetchCareersOptions";

interface Props {
  loadingSubjects: boolean;
  value: CareerOption[];
  onChange: (value: CareerOption[]) => void;
  maxSelected?: number;
}

// FIXME - Width del input no se ajusta al tamaño cuando hay una sola badge
export function CareerMultiDropdown({
  loadingSubjects,
  value,
  onChange,
  maxSelected = 2,
}: Props) {
  const { options, isLoading, error } = useFetchCareersOptions();

  return (
    <div className="relative max-w-sm w-full">
      <MultipleSelector
        value={value}
        onChange={onChange as (value: Option[]) => void}
        options={options}
        maxSelected={maxSelected}
        placeholder={
          value.length === maxSelected
            ? "Máximo alcanzado"
            : "Selecciona las carreras que deseas visualizar"
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
                ? " No se encontraron carreras. Por favor, intenta más tarde o recarga la página."
                : "No hay más carreras para seleccionar."}
            </p>
          )
        }
        inputProps={{
          className: "w-auto",
        }}
        badgeClassName="bg-blue-200 hover:bg-blue-300 text-black"
        className="bg-gray-200"
      />
    </div>
  );
}
