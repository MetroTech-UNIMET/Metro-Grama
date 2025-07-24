import * as React from 'react';

import { cn } from '@/lib/utils/className';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { FieldValues, Path } from 'react-hook-form';
import { type SelectProps } from 'radix-ui';
import type { Option } from '@/components/ui/types';

type LabelSelectProps = Omit<SelectProps, 'onValueChange'> & {
  label: string;
  containerClassName?: string;
  labelClassName?: string;

  required?: boolean;
};

type onValueChange = NonNullable<SelectProps['onValueChange']>;

export interface SelectFieldProps<T extends FieldValues> extends LabelSelectProps {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;

  className?: string;
  readOnly?: boolean;

  onValueChange?: (value: string, onChange: onValueChange) => void;
  options: Option[];

  popoverContainer?: HTMLElement;
}

function FormSelectField<T extends FieldValues>({
  name,
  disabled,
  label,
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
}: SelectFieldProps<T>) {
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
            <FormLabel className={labelClassName} required showColorsState={showColorsState}>
              {label}
            </FormLabel>

            <Select
              onValueChange={(value) => {
                if (!value) return;
                onValueChangeProps ? onValueChangeProps(value, onChange) : onChange(value);
              }}
              value={value}
              {...field}
              disabled={disabled || readOnly || field.disabled}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    {
                      'border-red-500 bg-red-500/10': hasError && showColorsState,
                      'bg-white': !hasError && showColorsState,
                    },
                    className,
                  )}
                >
                  <SelectValue {...props} />
                </SelectTrigger>
              </FormControl>

              <SelectContent container={popoverContainer}>
                {options.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
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
