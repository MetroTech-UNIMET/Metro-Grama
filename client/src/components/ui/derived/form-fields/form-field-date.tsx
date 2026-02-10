import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

import type { FieldValues, Path } from 'react-hook-form';
import type { PropsBase, PropsSingle } from 'react-day-picker';
import type { CommonLabelProps, CommonErrorProps } from '../../types/forms.types';

type OnSelectType = PropsSingle['onSelect'];
type DisabledType = PropsBase['disabled'];

export interface DateFieldProps<T extends FieldValues>
  extends Omit<PropsSingle, 'onSelect' | 'mode' | 'required'>,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;
  disabled?: boolean;
  required?: boolean;

  onSelect?: (date: Date | undefined, onChange: OnSelectType) => void;
  disableByDate?: DisabledType;

  popoverContainer?: HTMLElement;
}

function FormDateField<T extends FieldValues>({
  name,
  disabled,
  disableByDate,

  label,
  containerClassName,
  labelClassName,
  descriptionLabel,

  onSelect: onSelectProps,
  showErrors = true,
  showColorsState = true,
  popoverContainer,
  ...props
}: DateFieldProps<T>) {
  const [popOverRef, setPopOverRef] = useState<HTMLDivElement | null>(null);

  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { ref, onChange, ...field }, fieldState }) => {
        const isDisabled = disabled || field.disabled;
        const hasError = fieldState.invalid;
        return (
          <FormItem className={cn('flex flex-col', containerClassName)}>
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

            <Popover modal={false}>
              <PopoverTrigger asChild disabled={isDisabled}>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'h-10.5 rounded-[10px] border border-gray-100 pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                      hasError && 'border-destructive bg-destructive/10',
                    )}
                  >
                    {field.value ? (
                      format(field.value, 'PPP', { locale: es })
                    ) : (
                      <span>Escoge una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className="z-50 w-auto p-0"
                align="start"
                container={popoverContainer}
                ref={(ref) => setPopOverRef(ref)}
              >
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    onSelectProps ? onSelectProps(date, onChange) : onChange(date);
                  }}
                  disabled={disableByDate || isDisabled}
                  {...props}
                  {...field}
                  captionLayout="dropdown"
                  startMonth={new Date(1960, 0)}
                  endMonth={new Date(2030, 0)}
                  container={popOverRef ?? undefined}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            {showErrors && <FormMessage className="mt-1" />}
          </FormItem>
        );
      }}
    />
  );
}

export { FormDateField };
