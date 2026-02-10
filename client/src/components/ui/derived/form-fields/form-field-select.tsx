import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { FieldValues, Path } from 'react-hook-form';
import type { Option } from '@/components/ui/types/option.types';
import type { CommonErrorProps, CommonLabelProps } from '@/components/ui/types/forms.types';

type SelectProps = React.ComponentProps<typeof Select>;

type onValueChange = NonNullable<SelectProps['onValueChange']>;

export interface SelectFieldProps<T extends FieldValues, J = string | number, K = undefined>
  extends Omit<SelectProps, 'onValueChange'>,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

  className?: string;
  readOnly?: boolean;

  onValueChange?: (value: J, onChange: onValueChange) => void;
  options: Option<J, K>[];

  popoverContainer?: HTMLElement;
}

function FormSelectField<T extends FieldValues, J = string | number, K = undefined>({
  name,
  disabled,

  label,
  descriptionLabel,
  containerClassName,
  labelClassName,

  required,
  className,
  readOnly = false,
  onValueChange: onValueChangeProps,
  showErrors = true,
  showColorsState = true,
  options,
  popoverContainer,
  ...props
}: SelectFieldProps<T, J, K>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { onChange, value, ...field }, fieldState }) => {
        const hasError = fieldState.invalid;

        return (
          <FormItem
            className={cn(
              {
                'opacity-60': readOnly,
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

            <Select
              onValueChange={(value) => {
                if (Array.isArray(value)) throw new Error('Array values are not supported, use Multidropdown');

                onValueChangeProps ? onValueChangeProps(value, onChange) : onChange(value);
              }}
              value={value}
              {...field}
              items={options}
              disabled={disabled || readOnly || field.disabled}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    'mb-0',
                    {
                      'border-red-500 bg-red-500/10': hasError && showColorsState,
                      'bg-white': !hasError && showColorsState,
                    },
                    className,
                  )}
                >
                  <SelectValue {...props}></SelectValue>
                </SelectTrigger>
              </FormControl>

              <SelectContent container={popoverContainer}>
                {options.map((option) => (
                  <SelectItem key={String(option.value)} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showErrors && <FormMessage className="mt-1">{fieldState.error?.message}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}

FormSelectField.displayName = 'FormSelectField';

export { FormSelectField };
