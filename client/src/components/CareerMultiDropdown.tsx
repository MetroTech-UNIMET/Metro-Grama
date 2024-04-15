import { getCareers } from "@/api/careersApi";
import { Career } from "@/interfaces/Career";
import MultipleSelector, { Option } from "@ui/multidropdown";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Spinner } from "@ui/spinner";

interface Props {
  value: Option[];
  onChange: (value: Option[]) => void;
  maxSelected?: number;
}

export function CareerMultiDropdown({
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

  const options =
    data?.map((career) => ({
      value: career.id,
      label: `${career.emoji} ${career.name}`,
    })) ?? [];

  return (
    <div className="relative max-w-sm ">
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
        commandProps={{
          className: "absolute z-10 h-auto",
        }}
        inputProps={{
          className: "w-auto",
        }}
        badgeClassName="bg-blue-300 text-black"
        className="bg-gray-200"
      />
    </div>
  );
}
