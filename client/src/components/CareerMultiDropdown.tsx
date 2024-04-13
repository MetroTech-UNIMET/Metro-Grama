import { getCareers } from "@/api/careersApi";
import { Career } from "@/interfaces/Career";
import MultipleSelector, { Option } from "@ui/multidropdown";
import { useState } from "react";
import { useQuery } from "react-query";

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

  if (error) return null;

  console.log(data);
  const options =
    data?.map((career) => ({
      value: career.id,
      label: career.name,
    })) ?? [];

  return (
    <div className="relative w-full max-w-sm">
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
        // TODO Spinner
        emptyIndicator={
          isLoading ? (
            "loading..."
          ) : (
            <p className="text-lg ">
              {options.length === 0
                ? " No se encontraron carreras. Por favor, intenta más tarde o recarga la página."
                : "No hay más carreras para seleccionar."}
            </p>
          )
        }
        commandProps={{
          className: "absolute z-10 w-full h-auto ",
        }}
        badgeClassName="bg-blue-300 text-black"
        className="bg-gray-200"
      />
  </div>
  );
}
