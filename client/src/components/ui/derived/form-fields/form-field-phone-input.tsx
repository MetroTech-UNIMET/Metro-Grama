import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PhoneInput, type PhoneInputProps } from '@/components/ui/derived/phone-input';

import type { FieldValues, Path } from 'react-hook-form';
import type { CommonErrorProps, CommonLabelProps } from '../../types/forms.types';

export interface FormPhoneInputFieldProps<T extends FieldValues>
  extends PhoneInputProps,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

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
  descriptionLabel,

  showErrors = true,
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
              <PhoneInput
                {...props}
                {...field}
                placeholder="+58 4XX XXXXXXX"
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

FormPhoneInputField.displayName = 'FormPhoneInputField';

export { FormPhoneInputField };
