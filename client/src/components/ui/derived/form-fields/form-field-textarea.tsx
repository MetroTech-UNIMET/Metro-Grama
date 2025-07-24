import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { FieldValues, Path } from 'react-hook-form';

type LabelTextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  label: string;
  containerClassName?: string;
  labelClassName?: string;

  required?: boolean;
};

type OnChangeType = React.ChangeEventHandler<HTMLTextAreaElement>;

export interface TextAreaFieldProps<T extends FieldValues> extends LabelTextAreaProps {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>, onChange: OnChangeType) => void;
}

function FormTextAreaField<T extends FieldValues>({
  name,
  disabled,
  id,
  label,
  containerClassName,
  labelClassName,
  required,
  className,
  onChange: onChangeProps,
  showErrors = true,
  showColorsState = true,
  ...props
}: TextAreaFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { ref, onChange, ...field }, fieldState }) => {
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
              required={required}
              showColorsState={showColorsState}
            >
              {label}
            </FormLabel>

            <FormControl>
              <Textarea
                className={cn(
                  {
                    'border-red-500 bg-red-500/10': hasError && showColorsState,
                  },
                  className,
                )}
                onChange={(e) => {
                  onChangeProps ? onChangeProps(e, onChange) : onChange(e);
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

FormTextAreaField.displayName = 'FormTextAreaField';

export { FormTextAreaField };
