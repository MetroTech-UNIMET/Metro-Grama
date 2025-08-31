import { cn } from '@/lib/utils/className';

import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import type { FieldValues, Path } from 'react-hook-form';
import type { RepresentationDocumentSchemaInput } from '@/lib/schemas/representation-document';
import type { CommonErrorProps, CommonLabelProps } from '../../types/forms.types';

const documentTypeOptions = [
  { value: 'V', label: 'V' },
  { value: 'G', label: 'G' },
  { value: 'E', label: 'E' },
  { value: 'J', label: 'J' },
];

interface RepresentationDocumentFieldProps<
  T extends FieldValues & RepresentationDocumentSchemaInput,
> extends CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

  required?: boolean;

  selectPlaceholder?: string;
  inputPlaceholder?: string;
  selectClassName?: string;
  inputClassName?: string;

  hasJOption?: boolean;

  popoverContainer?: HTMLElement;
}

function RepresentationDocumentField<T extends FieldValues & RepresentationDocumentSchemaInput>({
  name,

  label = 'Tipo y Número de Documento',
  descriptionLabel,
  containerClassName,
  labelClassName,

  required = false,
  selectPlaceholder = 'Tipo',
  inputPlaceholder = 'Ingrese el número...',
  selectClassName,
  inputClassName,

  hasJOption = false,
  showErrors = true,
  showColorsState = true,
  popoverContainer,
}: RepresentationDocumentFieldProps<T>) {
  return (
    <FormField
      name={name}
      rules={{}}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;
        const error =
          fieldState.error?.message ??
          (fieldState.error as any)?.documentNumber?.message ??
          (fieldState.error as any)?.documentType?.message;

        return (
          <FormItem className={cn(containerClassName)}>
            {label && (
              <FormLabel
                className={labelClassName}
                required={required}
                showColorsState={showColorsState}
                description={descriptionLabel}
              >
                {label}
              </FormLabel>
            )}
            <div className="flex flex-row gap-2">
              <FormControl>
                <Select
                  {...field}
                  name={`${name}.documentType`}
                  onValueChange={(value) => field.onChange({ ...field.value, documentType: value })}
                  value={field.value?.documentType}
                  required={required}
                >
                  <SelectTrigger
                    className={cn(
                      'w-20',
                      { 'border-destructive bg-destructive/10': hasError && showColorsState },
                      selectClassName,
                    )}
                  >
                    <SelectValue placeholder={selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent container={popoverContainer}>
                    {documentTypeOptions
                      .filter((option) => hasJOption || option.value !== 'J')
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>

              <FormControl>
                <Input
                  type="text"
                  {...field}
                  name={`${name}.documentNumber`}
                  placeholder={inputPlaceholder}
                  value={field.value?.documentNumber}
                  onChange={(e) =>
                    field.onChange({ ...field.value, documentNumber: e.target.value })
                  }
                  className={cn(
                    { 'border-destructive bg-destructive/10': hasError && showColorsState },
                    inputClassName,
                  )}
                  minLength={8}
                  maxLength={9}
                  required={required}
                />
              </FormControl>
            </div>
            {showErrors && hasError && <FormMessage>{error}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}

export default RepresentationDocumentField;
