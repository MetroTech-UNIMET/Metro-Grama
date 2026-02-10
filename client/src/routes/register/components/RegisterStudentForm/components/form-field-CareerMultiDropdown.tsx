import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CareerMultiDropdown } from '@components/CareerMultiDropdown';

import type { FieldValues, Path } from 'react-hook-form';

export interface FormMultipleSelectorFieldProps<T extends FieldValues>
  extends Omit<React.ComponentProps<typeof CareerMultiDropdown>, 'value' | 'onChange'> {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;

  containerClassName?: string;
  label: string;
  labelClassName?: string;

  popoverContainer?: HTMLElement;
}

function FormCareerMultiSelectorField<T extends FieldValues>({
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
            <FormLabel className={labelClassName} required={props.required} showColorsState={showColorsState}>
              {label}
            </FormLabel>

            <FormControl>
              <CareerMultiDropdown
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
              <FormMessage className="text-destructive/80 mt-1 text-sm">{fieldState.error?.message}</FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}

FormCareerMultiSelectorField.displayName = 'FormCareerMultiSelectorField';

export { FormCareerMultiSelectorField };
