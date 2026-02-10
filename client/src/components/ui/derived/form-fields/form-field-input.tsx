import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { ControllerFieldState, FieldValues, Path, UseFormStateReturn } from 'react-hook-form';
import type { CommonErrorProps, CommonLabelProps } from '../../types/forms.types';

type LabelInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> &
  CommonLabelProps & {
    startContent?: React.ReactNode;
    startContentClassName?: string;

    endContent?: React.ReactNode;
    endContentClassName?: string;

    required?: boolean;
  };

type OnChangeType = (...event: any[]) => void;

export interface InputFieldProps<T extends FieldValues> extends LabelInputProps, CommonErrorProps {
  name: Path<T>;
  customErrorMessage?(
    fieldState: ControllerFieldState,
    formState: UseFormStateReturn<FieldValues>,
  ): React.ReactNode;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>, onChange: OnChangeType) => void;
}

function FormInputField<T extends FieldValues>({
  name,
  disabled,
  id,
  label,
  descriptionLabel,
  containerClassName,
  labelClassName,

  startContent,
  startContentClassName,

  endContent,
  endContentClassName,

  className,
  onChange: onChangeProps,
  value: valueProps,
  customErrorMessage,
  showErrors = true,
  showColorsState = true,
  ...props
}: InputFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { onChange, ...field }, fieldState, formState }) => {
        const hasError = fieldState.invalid;

        // TODO - Borrar y hacer un input especial solo para number
        function handleValue(value: any) {
          if (!value || value === 0) return '';

          return value;
        }

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

            <div className="relative">
              {startContent && (
                <span
                  className={cn(
                    'absolute top-1/2 left-4.5 -translate-y-1/2',
                    startContentClassName,
                  )}
                >
                  {startContent}
                </span>
              )}

              <FormControl>
                <Input
                  {...field}
                  {...props}
                  className={cn(
                    {
                      '[&::-webkit-inner-spin-button]:mr-2':
                        props.type === 'number' && !!endContent,
                      'pl-12': !!startContent,
                      'pr-10': !!endContent,
                      'border-destructive bg-destructive/10': hasError && showColorsState,
                      'bg-white': !hasError && showColorsState,
                    },
                    className,
                  )}
                  onChange={(e) => {
                    if (props.type === 'number') {
                      const val = Number(e.target.value);
                      let value = val;

                      if (props.max !== undefined) {
                        value = Math.min(value, Number(props.max));
                      }
                      if (props.min !== undefined) {
                        value = Math.max(value, Number(props.min));
                      }

                      // Create a new event with the cleaned value
                      const newEvent = {
                        ...e,
                        target: {
                          ...e.target,
                          value: value.toString(),
                        },
                      };

                      onChangeProps ? onChangeProps(newEvent as any, onChange) : onChange(value);
                    } else {
                      onChangeProps ? onChangeProps(e, onChange) : onChange(e);
                    }
                  }}
                  value={handleValue(valueProps ?? field.value)}
                />
              </FormControl>

              {endContent && (
                <span
                  className={cn(
                    'absolute top-1/2 right-[18px] -translate-y-1/2',
                    endContentClassName,
                  )}
                >
                  {endContent}
                </span>
              )}
            </div>

            {showErrors && (
              <FormMessage className="mt-1">
                {fieldState.error?.message ?? customErrorMessage?.(fieldState, formState)}
              </FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}

FormInputField.displayName = 'FormInputField';

export { FormInputField };
