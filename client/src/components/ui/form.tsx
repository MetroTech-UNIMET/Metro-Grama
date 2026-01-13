'use client';

import * as React from 'react';
import { Slot as SlotPrimitive } from 'radix-ui';

import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils/className';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext>
  );
};

const useFormField = () => {
  const fieldContext = React.use(FormFieldContext);
  const itemContext = React.use(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

interface ExtraFormLabelProps {
  required?: boolean;
  showColorsState?: boolean;
  description?: React.ReactNode;
}

function FormLabel({
  className,
  showColorsState = true,
  required = false,
  description,
  ...props
}: React.ComponentProps<typeof Label> & ExtraFormLabelProps) {
  const { formItemId, invalid } = useFormField();

  if (!props.children) return null;
  return (
    <Label
      className={cn(
        'text-body-sm block font-semibold text-balance',
        {
          'text-destructive': invalid && showColorsState,
        },
        className,
      )}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {description && description}
      {required && <span className="text-red-500"> *</span>}
    </Label>
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof SlotPrimitive.Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <SlotPrimitive.Slot
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={cn('text-[0.8rem] text-neutral-500 dark:text-neutral-400', className)}
      {...props}
    />
  );
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error?.message ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-red-500 dark:text-red-900', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
