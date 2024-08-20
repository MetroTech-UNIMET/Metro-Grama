// Modified from https://www.armand-salle.fr/post/autocomplete-select-shadcn-ui/
import {
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
  type InputHTMLAttributes,
} from "react";
import { Check } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";

import {
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Skeleton } from "@ui/skeleton";

import { cn } from "@utils/className";

import type { Option } from "./multidropdown";

export interface AutoCompleteProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onSelect"> {
  options: Option[];
  emptyMessage: string;
  value?: Option | string;
  onSelect?: (value: Option) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** If true, onBlur will not clear if not selected an option  */
  allowFreeInput?: boolean;
  /** Function to use a different string than the label when selecting */
  customOnSelectLabeling?: (option: Option) => string;
  /** Function to call when the value changes */
  onValueChange?: (value: string | Option) => void;

  inputWrapperClassName?: string;
  listRelativeContainerClassName?: string;
  listContainerClassName?: string;
}

export default function AutoComplete({
  options,
  placeholder,
  emptyMessage,
  value,
  onSelect,
  disabled,
  allowFreeInput = false,
  customOnSelectLabeling = (option) => option.label,
  onValueChange,

  inputWrapperClassName,
  listRelativeContainerClassName,
  listContainerClassName,
  className,
  isLoading = false,
  ...props
}: AutoCompleteProps) {
  const valueIsString = typeof value === "string";

  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | undefined>(
    !valueIsString ? value : undefined
  );
  const [inputValue, setInputValue] = useState<string>(
    valueIsString ? value : value?.label || ""
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = options.find(
          (option) => option.label === input.value
        );
        if (optionToSelect) {
          setSelected(optionToSelect);
          onSelect?.(optionToSelect);
        } else {
          input.blur();
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, options, onSelect]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement, Element>) => {
      setOpen(false);

      if (!allowFreeInput) setInputValue(selected?.label || "");
      else if (selected?.value !== inputValue) {
        props.onChange?.({
          target: {
            value: inputValue,
          },
        } as React.ChangeEvent<HTMLInputElement>);
        setSelected(undefined);
        onValueChange?.(inputValue);
      } else if (!selected) onValueChange?.(inputValue);

      props.onBlur?.(event);
    },
    [selected, inputValue]
  );

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(customOnSelectLabeling(selectedOption));

      setSelected(selectedOption);
      onSelect?.(selectedOption);
      onValueChange?.(selectedOption);

      if (props.onChange) {
        const option = {
          label: selectedOption.label,
          value: selectedOption.value,
        };
        //@ts-ignore
        props.onChange({
          target: {
            value: valueIsString ? option.value : option,
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onSelect, onValueChange]
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} className="h-full">
      <div className="h-full">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("text-base h-full ", className)}
          inputWrapperClassName={cn("h-full", inputWrapperClassName)}
        />
      </div>

      <div className={cn("relative mt-1", listRelativeContainerClassName)}>
        <div
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none",
            listContainerClassName,
            isOpen ? "block" : "hidden"
          )}
        >
          <CommandList className="rounded-lg ring-1 ring-slate-200">
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {options.length > 0 && !isLoading ? (
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected?.value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn(
                        "flex w-full items-center gap-2",
                        !isSelected ? "pl-8" : null
                      )}
                    >
                      {isSelected ? <Check className="w-4" /> : null}
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                {emptyMessage}
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
}
