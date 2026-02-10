import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultipleSelector, {
  type MultipleSelectorProps,
} from '@/components/ui/derived/multidropdown';

import type { FieldValues, Path } from 'react-hook-form';
import type { CommonLabelProps, CommonErrorProps } from '../../types/forms.types';

export interface FormMultipleSelectorFieldProps<
  T extends FieldValues,
  J = string | number,
  K = undefined,
> extends Omit<MultipleSelectorProps<J, K>, 'selected'>,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

  popoverContainer?: HTMLElement;
}

function FormMultipleSelectorField<T extends FieldValues, J extends string | number, K>({
  name,
  disabled,
  id,

  label,
  containerClassName,
  labelClassName,
  descriptionLabel,

  className,
  showErrors = false,
  showColorsState = true,
  ...props
}: FormMultipleSelectorFieldProps<T, J, K>) {
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
            {label && (
              <FormLabel
                className={labelClassName}
                required={props.required}
                showColorsState={showColorsState}
                description={descriptionLabel}
              >
                {label}
              </FormLabel>
            )}

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
              <FormMessage className="text-destructive/80 mt-1 text-sm">
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
