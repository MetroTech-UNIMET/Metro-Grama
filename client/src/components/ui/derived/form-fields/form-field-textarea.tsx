import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { FieldValues, Path } from 'react-hook-form';
import type { CommonErrorProps, CommonLabelProps } from '../../types/forms.types';

type LabelTextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>;

type OnChangeType = React.ChangeEventHandler<HTMLTextAreaElement>;

export interface TextAreaFieldProps<T extends FieldValues>
  extends LabelTextAreaProps,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>, onChange: OnChangeType) => void;
}

function FormTextAreaField<T extends FieldValues>({
  name,
  disabled,
  id,

  label,
  descriptionLabel,
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
            {label && (
              <FormLabel
                className={labelClassName}
                required={required}
                showColorsState={showColorsState}
                description={descriptionLabel}
              >
                {label}
              </FormLabel>
            )}

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
                required={required}
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
