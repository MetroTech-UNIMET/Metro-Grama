import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultipleSelector, {
  type MultipleSelectorProps,
} from '@/components/ui/derived/multidropdown';

import type { FieldValues, Path } from 'react-hook-form';

export interface FormMultipleSelectorFieldProps<T extends FieldValues>
  extends Omit<MultipleSelectorProps, 'selected'> {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;

  containerClassName?: string;
  label: string;
  labelClassName?: string;

  popoverContainer?: HTMLElement;
}

function FormMultipleSelectorField<T extends FieldValues>({
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
}: FormMultipleSelectorFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;

        return (
          <FormItem
            className={cn(
              {
                'opacity-60': props.readOnly,
              },
              containerClassName,
            )}
          >
            <FormLabel
              className={labelClassName}
              required={props.required}
              showColorsState={showColorsState}
            >
              {label}
            </FormLabel>

            <FormControl>
              <MultipleSelector
                className={cn(
                  {
                    'border-destructive bg-destructive/10': hasError && showColorsState,
                  },
                  className,
                )}
                {...field}
                {...props}
              />
            </FormControl>

            {showErrors && hasError && (
              <FormMessage className="mt-1 text-sm text-destructive/80">
                {fieldState.error?.message}
              </FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}

FormMultipleSelectorField.displayName = 'FormMultipleSelectorField';

export { FormMultipleSelectorField };
