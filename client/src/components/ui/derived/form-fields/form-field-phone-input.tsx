import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PhoneInput, type PhoneInputProps } from '@/components/ui/derived/phone-input';

import type { FieldValues, Path } from 'react-hook-form';

export interface FormPhoneInputFieldProps<T extends FieldValues> extends PhoneInputProps {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;

  containerClassName?: string;
  label: string;
  labelClassName?: string;

  popoverContainer?: HTMLElement;
}

function FormPhoneInputField<T extends FieldValues>({
  name,
  disabled,
  id,
  label,
  containerClassName,
  labelClassName,
  className,
  showErrors = false,
  showColorsState = true,
  popoverContainer,

  ...props
}: FormPhoneInputFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;
        // const phoneNumber = field.value ? parsePhoneNumberFromString(field.value) : undefined;
        // const value = phoneNumber ? phoneNumber.number : '';
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
            <FormLabel
              className={labelClassName}
              required={props.required}
              showColorsState={showColorsState}
            >
              {label}
            </FormLabel>

            <FormControl>
              <PhoneInput
                {...props}
                {...field}
                popoverContainer={popoverContainer}
                numberInputProps={{
                  className: cn(
                    {
                      'border-destructive bg-destructive/10': hasError && showColorsState,
                    },
                    className,
                  ),
                }}
                countrySelectProps={{
                  className: cn({
                    'bg-destructive/10 border-destructive': hasError && showColorsState,
                  }),
                }}
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

FormPhoneInputField.displayName = 'FormPhoneInputField';

export { FormPhoneInputField };
