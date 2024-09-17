import * as React from "react";

import { cn } from "@utils/className";
import { Input } from "@ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";

import type { FieldValues, Path } from "react-hook-form";

type FloatingLabelInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  containerClassname?: string;
  labelClassName?: string;
};

interface FloatingLabelInputFieldProps<T extends FieldValues>
  extends FloatingLabelInputProps {
  name: Path<T>;
  showErrors?: boolean;
}

function FloatingLabelInputField<T extends FieldValues>({
  name,
  disabled,
  id,
  label,
  containerClassname,
  labelClassName,
  className,
  showErrors = false,
  ...props
}: FloatingLabelInputFieldProps<T>) {
  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { ref, onChange, ...field }, fieldState }) => {
        const hasError = fieldState.invalid;
        const isSuccessful = !fieldState.invalid && fieldState.isTouched;

        return (
          // <FormItem className={cn("relative", containerClassname)}>
          //   <FormControl>
          //     <FloatingInput
          //       className={cn(
          //         "read-only:cursor-not-allowed read-only:opacity-50",
          //         {
          //           "bg-destructive/10": hasError,
          //           "bg-success/10": isSuccessful,
          //         }
          //       )}
          //       onChange={(e) => {
          //         if (props.type === "number") {
          //           onChange(Number(e.target.value));
          //         } else {
          //           onChange(e);
          //         }
          //       }}
          //       {...props}
          //       {...field}
          //     />
          //   </FormControl>

          //   <FormLabel
          //     className={cn(
          //       "peer-focus:secondary peer-focus:dark:secondary absolute start-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-background px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-background rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4",
          //       {
          //         "text-destructive/80": hasError,
          //         "text-success/80": isSuccessful,
          //       }
          //     )}
          //   >
          //     {label}
          //   </FormLabel>

          //   {showErrors && hasError && (
          //     <FormMessage className="text-destructive/80 text-sm mt-1">
          //       {fieldState.error?.message}
          //     </FormMessage>
          //   )}
          // </FormItem>

          <FormItem className={cn("relative", containerClassname)}>
            <FormControl>
              <Input
                className={cn(
                  "block h-auto pb-2.5 pt-5 w-full text-gray-900 border-gray-300 appearance-none outline-none focus:ring-0 focus:border-primary-500 peer",
                  {
                    "bg-destructive/10 border-destructive": hasError,
                    "bg-success/10 border-success": isSuccessful,
                    "opacity-60": props.readOnly
                  },
                  className
                )}
                onChange={(e) => {
                  if (props.type === "number") {
                    onChange(Number(e.target.value));
                  } else {
                    onChange(e);
                  }
                }}
                placeholder={props.placeholder ?? " "}
                {...props}
                {...field}
              />
            </FormControl>

            <FormLabel
              className={cn(
                "absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-primary-500 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto",
                {
                  "-translate-y-4 scale-75": props.placeholder,
                  "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4":
                    !props.placeholder,
                    "opacity-60": props.readOnly
                },
                labelClassName
              )}
            >
              {label}
            </FormLabel>

            {showErrors && hasError && (
              <FormMessage className="text-destructive/80 text-sm mt-1">
                {fieldState.error?.message}
              </FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}

FloatingLabelInputField.displayName = "FloatingLabelInputField";

export { FloatingLabelInputField };
