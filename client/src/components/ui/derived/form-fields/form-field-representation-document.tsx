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

const documentTypeOptions = [
  { value: 'V', label: 'V' },
  { value: 'G', label: 'G' },
  { value: 'E', label: 'E' },
];

type RepresentationDocumentFieldProps = {
  name: string;
  label?: string;
  containerClassName?: string;
  labelClassName?: string;

  required?: boolean;

  selectPlaceholder?: string;
  inputPlaceholder?: string;
  selectClassName?: string;
  inputClassName?: string;

  showErrors?: boolean;
  showColorsState?: boolean;
};

function RepresentationDocumentField({
  name,
  label = 'Tipo y Número de Documento',
  required = false,
  selectPlaceholder = 'Tipo',
  inputPlaceholder = 'Ingrese el número...',
  selectClassName,
  inputClassName,
  containerClassName,
  labelClassName,
  showErrors = true,
  showColorsState = true,
}: RepresentationDocumentFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;

        return (
          <FormItem className={cn(containerClassName)}>
            <FormLabel className={labelClassName} required={required}>
              {label}
            </FormLabel>

            <div className='flex flex-row gap-2'>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange({ ...field.value, documentType: value })}
                  value={field.value?.documentType}
                >
                  <SelectTrigger className={cn('w-20',selectClassName)}>
                    <SelectValue placeholder={selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeOptions.map((option) => (
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
                  placeholder={inputPlaceholder}
                  value={field.value?.documentNumber}
                  onChange={(e) =>
                    field.onChange({ ...field.value, documentNumber: e.target.value })
                  }
                  className={cn(
                    { 'border-red-500 bg-red-500/10': hasError && showColorsState },
                    inputClassName,
                  )}
                />
              </FormControl>
            </div>
            {showErrors && hasError && <FormMessage>{fieldState.error?.message}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}

export default RepresentationDocumentField;
