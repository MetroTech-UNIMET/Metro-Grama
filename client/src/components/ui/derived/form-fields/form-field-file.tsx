import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { FieldValues, Path } from 'react-hook-form';

type LabelInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> & {
  label?: string;
  containerClassName?: string;
  labelClassName?: string;

  required?: boolean;
};

type OnChangeType = React.ChangeEventHandler<HTMLInputElement>;

export interface InputFileFieldProps<T extends FieldValues> extends LabelInputProps {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, onChange: OnChangeType) => void;
}

function FormInputFileField<T extends FieldValues>({
  name,
  disabled,
  id,
  label,
  containerClassName,
  labelClassName,
  className,
  onChange: onChangeProps,
  showErrors = true,
  showColorsState = true,
  ...props
}: InputFileFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { ref, value, onChange, ...field }, fieldState }) => {
        const hasError = fieldState.invalid;

        return (
          <FormItem className={containerClassName}>
            <FormLabel
              className={labelClassName}
              required={props.required}
              showColorsState={showColorsState}
            >
              {label}
            </FormLabel>

            <FormControl>
              <Input
                className={cn(
                  {
                    'border-red-500 bg-red-500/10': hasError && showColorsState,
                    'opacity-60': props.readOnly,
                  },
                  className,
                )}
                type="file"
                onChange={(e) => {
                  const files = e.target.files;
                  onChangeProps ? onChangeProps(e, onChange) : onChange(files);
                }}
                placeholder={props.placeholder ?? ' '}
                {...props}
                {...field}
              />
            </FormControl>

            {showErrors && <FormMessage className="mt-1">{fieldState.error?.message}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}

FormInputFileField.displayName = 'FormInputFileField';

export { FormInputFileField };
