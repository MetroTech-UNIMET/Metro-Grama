import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import type { ControllerFieldState, FieldValues, Path, UseFormStateReturn } from 'react-hook-form';
import type { CommonLabelProps, CommonErrorProps } from '../../types/forms.types';

type LabelInputNumberProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>;

type OnChangeType = (...event: any[]) => void;

export interface InputFieldNumberProps<T extends FieldValues>
  extends LabelInputNumberProps,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

  customErrorMessage?(
    fieldState: ControllerFieldState,
    formState: UseFormStateReturn<FieldValues>,
  ): React.ReactNode;
  subContainerClassName?: string;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>, onChange: OnChangeType) => void;

  /** When the value is undefined, this will be the value that overrides it */
  defaultValue?: number;
}

function FormInputNumberField<T extends FieldValues>({
  name,
  disabled,
  id,

  label,
  containerClassName,
  subContainerClassName,
  labelClassName,
  descriptionLabel,

  className,
  onChange: onChangeProps,
  defaultValue = 0,
  customErrorMessage,
  showErrors = true,
  showColorsState = true,
  ...props
}: InputFieldNumberProps<T>) {
  const handleIncrement = (onChange: OnChangeType, currentValue: number) => {
    if (disabled || props.readOnly) return;
    if (props.max !== undefined && currentValue >= Number(props.max)) return;

    onChange(currentValue + 1);
  };

  const handleDecrement = (onChange: OnChangeType, currentValue: number) => {
    if (disabled || props.readOnly) return;
    if (props.min !== undefined && currentValue <= Number(props.min)) return;

    onChange(currentValue - 1);
  };

  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { onChange, ...field }, fieldState, formState }) => {
        const hasError = fieldState.invalid;

        const value = field.value ?? defaultValue;

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
            <div
              className={cn(
                'border-stroke focus-within:ring-secondary flex items-center rounded-[7px] border-[1.5px] focus-within:ring-2 focus-within:ring-offset-2',
                subContainerClassName,
              )}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDecrement(onChange, Number(value))}
                disabled={
                  disabled || (props.min !== undefined && Number(value) <= Number(props.min))
                }
                className="mr-2 rounded-none border-r py-0"
              >
                -
              </Button>
              <FormControl>
                <Input
                  {...props}
                  {...field}
                  type="number"
                  className={cn(
                    'border-0 px-0 text-center ring-0! ring-offset-0! [&::-webkit-inner-spin-button]:hidden',
                    {
                      'border-destructive bg-destructive/10': hasError && showColorsState,
                    },
                    className,
                  )}
                  onChange={(e) => {
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
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-') {
                      e.preventDefault();
                      const newValue = Number(value) * -1;
                      if (props.min !== undefined && newValue <= Number(props.min)) return;
                      if (props.max !== undefined && newValue >= Number(props.max)) return;

                      const event = {
                        ...e,
                        target: {
                          ...e.target,
                          value: newValue.toString(),
                        },
                      };
                      onChangeProps ? onChangeProps(event as any, onChange) : onChange(newValue);
                    } else if (e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                  value={value}
                />
              </FormControl>

              <Button
                type="button"
                variant="ghost"
                onClick={() => handleIncrement(onChange, Number(value))}
                disabled={
                  disabled || (props.max !== undefined && Number(value) >= Number(props.max))
                }
                className="ml-2 rounded-none border-l py-0"
              >
                +
              </Button>
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

FormInputNumberField.displayName = 'FormInputNumberField';

export { FormInputNumberField };
