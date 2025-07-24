import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { type CheckboxProps } from 'radix-ui';
import type { FieldValues, Path } from 'react-hook-form';
import { cn } from '@/lib/utils/className';

interface CheckboxFieldProps<T extends FieldValues> extends Omit<CheckboxProps, 'onValueChange'> {
  name: Path<T>;

  containerClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function FormFieldCheckbox<T extends FieldValues>({
  name,
  disabled,
  required,
  containerClassName,
  className,

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
            'space-y-0',
            containerClassName,
          )}
        >
          <FormControl>
            <Checkbox checked={value} onCheckedChange={onChange} {...props} {...field} />
          </FormControl>

          {!props.asChild && children}
        </FormItem>
      )}
    />
  );
}
