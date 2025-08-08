import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AutoComplete, { type AutoCompleteProps } from '@/components/ui/derived/autocomplete';

import { useWatch, type FieldValues, type Path } from 'react-hook-form';

export interface FormAutocompleteFieldProps<
  T extends FieldValues,
  J extends string | number = string | number,
  K = undefined,
> extends AutoCompleteProps<J, K> {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;

  containerClassName?: string;
  label?: string;
  labelClassName?: string;

  saveAsOption?: boolean;
}

function FormAutocompleteField<T extends FieldValues, J extends string | number, K>({
  name,
  disabled,
  id,
  label,
  containerClassName,
  labelClassName,
  className,
  showErrors = false,
  showColorsState = true,
  ...props
}: FormAutocompleteFieldProps<T, J, K>) {
  const value = useWatch({ name });

  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { ref, value: _, ...field }, fieldState }) => {
        const hasError = fieldState.invalid;
        // const isSuccessful = !fieldState.invalid && fieldState.isTouched && fieldState.isDirty;

        return (
          <FormItem
            className={cn(
              {
                'opacity-60': props.readOnly,
              },
              containerClassName,
            )}
          >
            {label && (
              <FormLabel className={labelClassName} required={props.required} showColorsState={showColorsState}>
                {label}
              </FormLabel>
            )}

            <FormControl>
              <AutoComplete
                inputWrapperClassName={cn(
                  {
                    'bg-destructive/10 border-destructive': hasError && showColorsState,
                    'bg-white': !hasError && showColorsState,
                    // 'bg-success/10 border-success': isSuccessful && showColorsState,
                  },
                  className,
                )}
                placeholder={props.placeholder ?? ' '}
                {...props}
                {...field}
                value={value}
                disabled={disabled || props.readOnly}
              />
            </FormControl>

            {showErrors && hasError && (
              <FormMessage className="text-destructive/80 mt-1 text-sm">{fieldState.error?.message}</FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}

FormAutocompleteField.displayName = 'FormAutocompleteField';

export { FormAutocompleteField };
