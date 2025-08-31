import { cn } from '@/lib/utils/className';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

import type { FieldValues, Path } from 'react-hook-form';
import type { CommonLabelProps, CommonErrorProps } from '../../types/forms.types';

type CheckboxProps = React.ComponentProps<typeof Checkbox>;
type CheckedState = NonNullable<CheckboxProps['checked']>;
type OnChangeType = (...event: any[]) => void;

interface CheckboxFieldProps<T extends FieldValues>
  extends Omit<CheckboxProps, 'onValueChange' | 'onChange'>,
    CommonLabelProps,
    CommonErrorProps {
  name: Path<T>;

  containerClassName?: string;
  children?: React.ReactNode;

  onChange?: (checked: CheckedState, onChange: OnChangeType) => void;
}

export function FormCheckboxField<T extends FieldValues>({
  name,
  disabled,
  containerClassName,

  className,
  label,
  labelClassName,
  descriptionLabel,

  showErrors = true,
  showColorsState = true,

  onChange: onChangeProps,

  children,
  ...props
}: CheckboxFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem
          className={cn(
            {
              'opacity-60': disabled,
            },
            'space-y-0!',
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

          <FormControl>
            <Checkbox
              checked={value}
              onCheckedChange={(e) => {
                onChangeProps ? onChangeProps(e, onChange) : onChange(e);
              }}
              {...props}
              {...field}
            />
          </FormControl>

          {!props.asChild && children}
          {showErrors && <FormMessage className="mt-1" />}
        </FormItem>
      )}
    />
  );
}
