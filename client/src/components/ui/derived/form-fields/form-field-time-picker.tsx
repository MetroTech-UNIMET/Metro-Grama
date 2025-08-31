import { cn } from '@/lib/utils/className';

import { TimePicker, type TimePickerProps } from '@/components/ui/derived/time-picker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { FieldValues, Path } from 'react-hook-form';
import type { CommonLabelProps, CommonErrorProps } from '../../types/forms.types';

type onChangeType = TimePickerProps['onChange'];

export interface FormTimePickerFieldProps<T extends FieldValues>
  extends CommonLabelProps,
    CommonErrorProps,
    Omit<TimePickerProps, 'value' | 'onChange'> {
  name: Path<T>;
  required?: boolean;
  readOnly?: boolean;

  onChange?: (date: Date, onChange: onChangeType) => void;
}

function FormTimePickerField<T extends FieldValues>({
  name,
  onChange: onChangeProps,
  readOnly,

  label,
  descriptionLabel,
  containerClassName,
  labelClassName,
  className,

  showErrors = true,
  showColorsState = true,
  ...props
}: FormTimePickerFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={props.disabled}
      render={({ field: { value, onChange }, fieldState }) => {
        const hasError = fieldState.invalid;
        return (
          <FormItem
            className={cn('flex flex-col', containerClassName, {
              'opacity-60': readOnly,
            })}
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
              <TimePicker
                value={value as Date}
                onChange={(date) => {
                  onChangeProps ? onChangeProps(date, onChange) : onChange(date);
                }}
                className={cn(className, {
                  'border-destructive bg-destructive/10': hasError && showColorsState,
                })}
                disabled={readOnly || props.disabled}
                {...props}
              />
            </FormControl>

            {showErrors && <FormMessage className="mt-1" />}
          </FormItem>
        );
      }}
    />
  );
}

FormTimePickerField.displayName = 'FormTimePickerField';

export { FormTimePickerField };
