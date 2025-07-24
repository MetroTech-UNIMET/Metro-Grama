import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

import type { FieldValues, Path } from 'react-hook-form';
import type { DayPickerSingleProps } from 'react-day-picker';

type LabelDatePickerProps = Omit<DayPickerSingleProps, 'onSelect' | 'disabled' | 'mode'> & {
  label: string;
  containerClassName?: string;
  labelClassName?: string;

  required?: boolean;
  disabled?: boolean;

  popoverContainer?: HTMLElement;
};

type OnSelectType = DayPickerSingleProps['onSelect'];
type DisabledType = DayPickerSingleProps['disabled'];

export interface DateFieldProps<T extends FieldValues> extends LabelDatePickerProps {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;
  onSelect?: (date: Date | undefined, onChange: OnSelectType) => void;

  disableByDate?: DisabledType;
}

function FormDateField<T extends FieldValues>({
  name,
  disabled,
  disableByDate,
  id,
  label,
  containerClassName,
  labelClassName,
  className,
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
      render={({ field: { ref, onChange, ...field } }) => {
        return (
          <FormItem className={cn('flex flex-col', containerClassName)}>
            <FormLabel
              className={labelClassName}
              required={props.required}
              showColorsState={showColorsState}
            >
              {label}
            </FormLabel>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'h-[2.625rem] rounded-[10px] border-gray-100 pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    {field.value ? format(field.value, 'PPP') : <span>Escoge una fecha</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto p-0"
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
                  disabled={disableByDate}
                  {...props}
                  {...field}
                  captionLayout="dropdown-buttons"
                  fromYear={1960}
                  toYear={2030}
                  container={popOverRef ?? undefined}
                  initialFocus
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
