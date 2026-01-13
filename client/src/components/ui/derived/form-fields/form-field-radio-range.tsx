import * as React from 'react';

import { cn } from '@/lib/utils/className';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import type { FieldValues, Path } from 'react-hook-form';
import type { CommonErrorProps, CommonLabelProps } from '@/components/ui/types/forms.types';

export interface RadioRangeFieldProps<T extends FieldValues> extends CommonLabelProps, CommonErrorProps {
  name: Path<T>;

  /** Inclusive minimum value */
  min: number;
  /** Inclusive maximum value */
  max: number;

  /** Optional labels for each tick. Will render below the radio if provided. */
  radioLabels?: (string | undefined)[];

  className?: string;
  itemLabelClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

function FormRadioRangeField<T extends FieldValues>({
  name,
  min,
  max,
  radioLabels,

  label,
  descriptionLabel,
  containerClassName,
  labelClassName,

  className,
  itemLabelClassName,
  disabled,
  readOnly,
  required,
  showErrors = true,
  showColorsState = true,
}: RadioRangeFieldProps<T>) {
  if (!Number.isInteger(min) || !Number.isInteger(max))
    throw Error('[FormRadioRangeField] min and max should be integers');
  if (max < min) throw Error('[FormRadioRangeField] max should be greater than or equal to min');

  const totalOptions = max - min + 1;

  if (radioLabels?.length && radioLabels.length !== totalOptions)
    throw Error('[FormRadioRangeField] radioLabels length should match the range size (max - min + 1)');

  const values = React.useMemo(() => {
    const len = Math.max(0, totalOptions);
    return Array.from({ length: len }, (_, i) => min + i);
  }, [min, max]);

  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { value, onChange, ...field }, fieldState }) => {
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

            <FormControl>
              <div className={cn('relative w-full py-3', className)}>
                {/* background line */}
                <div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute top-[18px] right-1 left-1 h-[2px] rounded bg-neutral-200',
                    {
                      'bg-destructive/40': hasError && showColorsState,
                    },
                  )}
                />

                <RadioGroup
                  value={value === undefined || value === null ? undefined : value}
                  onValueChange={(v) => onChange(v)}
                  className={cn(
                    'relative flex w-full items-center justify-between',
                    // also keep colors state by slightly tinting selected indicator via css vars
                  )}
                  {...field}
                  disabled={disabled || readOnly || field.disabled}
                >
                  {values.map((v, idx) => (
                    <div key={v} className="mb-auto flex flex-1 flex-col items-center">
                      <RadioGroupItem value={v} className="bg-white" />
                      {radioLabels?.[idx] && (
                        <div
                          className={cn('mt-2 text-center text-[11px] leading-3 text-neutral-500', itemLabelClassName)}
                        >
                          {radioLabels[idx]}
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </FormControl>

            {showErrors && <FormMessage className="mt-1">{fieldState.error?.message}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}

FormRadioRangeField.displayName = 'FormRadioRangeField';

export { FormRadioRangeField };
