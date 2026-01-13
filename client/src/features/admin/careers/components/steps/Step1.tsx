import { FormInputField } from "@ui/derived/form-fields/form-field-input";

interface Props {
  mode: "create" | "edit";
}

export function Step1({ mode }: Props ) {
  return (
    <fieldset className="mb-8 flex flex-row gap-4">
      <FormInputField name="name" label="Nombre de la carrera" containerClassName="w-full" showErrors={true} />

      <FormInputField
        name="id"
        label="Identificador"
        containerClassName="max-w-26"
        showErrors={true}
        readOnly={mode === 'edit'}
      />

      <FormInputField name="emoji" label="Emoji" containerClassName=" max-w-16" showErrors={true} />
    </fieldset>
  );
}
