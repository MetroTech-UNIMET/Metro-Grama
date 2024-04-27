import { getCareers } from "@/api/careersApi";
import { Career } from "@/interfaces/Career";
import MultipleSelector, { Option } from "@ui/derived/multidropdown";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { Spinner } from "@ui/spinner";

interface Props {
  loadingSubjects: boolean;
  value: Option[];
  onChange: (value: Option[]) => void;
  maxSelected?: number;
}

// FIXME - Width del input no se ajusta al tamaño cuando hay una sola badge
export function CareerMultiDropdown({
  loadingSubjects,
  value,
  onChange,
  maxSelected = 2,
}: Props) {
  const { data, isLoading, error } = useQuery<Career[]>(
    ["careers"],
    getCareers
  );

  useEffect(() => {
    // TODO - Change the queryparams
  }, [value]);

  console.log(data);

  const options =
    data?.map((career) => ({
      value: career.id,
      label: `${career.emoji} ${career.name}`,
    })) ?? [];

  return (
    <div className="relative max-w-sm w-full">
      <MultipleSelector
        value={value}
        onChange={onChange}
        options={options}
        maxSelected={maxSelected}
        placeholder={
          value.length === maxSelected
            ? "Máximo alcanzado"
            : "Selecciona las carreras que deseas visualizar"
        }
        showSpinner={loadingSubjects}
        emptyIndicator={
          isLoading ? (
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
        badgeClassName="bg-blue-200 hover:bg-blue-300 text-black"
        className="bg-gray-200 "
      />
    </div>
  );
}
