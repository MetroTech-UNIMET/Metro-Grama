import type { FieldValues, SubmitHandler } from "react-hook-form";

interface Props<T extends FieldValues>  {
  mode: "create" | "edit";
  onCreate?: (data: T) => Promise<string>;
  onEdit?: (data: T) =>  Promise<string>;
  onSucces?: (message: string) => void;
}

export default function useFormSubmit<T extends FieldValues>({ mode, onCreate, onEdit }: Props<T>) {

  const onSubmit: SubmitHandler<T> = async (data) => {
    try {
      if (mode === "create") {
        if (onCreate) {
          await onCreate(data);
        }
      } else {
        if (onEdit) {
          await onEdit(data);
        }
      }
    } catch (error: any) {
      
    }
  }

  return {onSubmit};
}
