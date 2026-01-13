// Modified from https://www.armand-salle.fr/post/autocomplete-select-shadcn-ui/
import { useState, useRef, useCallback, type KeyboardEvent, type InputHTMLAttributes, useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';

import { CommandInput, CommandGroup, CommandItem, CommandList, Command } from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { transToGroupOption } from '@/components/ui/utils/options';
import { cn } from '@/lib/utils/className';

import type { Option, GroupOption } from '@/components/ui/types/option.types';
import type { BaseCustomCommand } from './custom-command-items/types';
// import { filterIgnoringAccents } from "@utils/filters";

export interface AutoCompleteProps<TValue = string | number, TData = undefined>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onSelect'> {
  options: Option<TValue, TData>[] | GroupOption<TValue, TData>;
  emptyIndicator?: React.ReactNode;
  value?: Option<TValue, TData> | Option<TValue, TData>['value'];
  onSelect?: (value: Option<TValue, TData>) => void;
  /** If true,  will save the value as an Option */
  saveAsOption?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  /** Function to determine if an option should be disabled */
  isOptionDisabled?: (option: Option<TValue, TData>) => boolean;
  placeholder?: string;
  /** If true, onBlur will not clear if not selected an option  */
  allowFreeInput?: boolean;
  /** If true, the autocomplete will act as normal input and not show the options */
  onlyInput?: boolean;
  /** Function to use a different string than the label when selecting. Make sure to pass*/
  customOnSelectLabeling?: (option: Option<TValue, TData>) => string;
  /** Function to call when the value changes */
  onValueChange?: (value: string | Option<TValue, TData>) => void;

  inputWrapperClassName?: string;
  listClassName?: string;

  /** Group the options by provided key. Only needed if options is an array instead of GroupOption */
  groupBy?: string;

  /** Custom component to render more data than the value or label */
  CustomSelectItem?: React.ComponentType<BaseCustomCommand<TValue, TData>>;

  popoverContainer?: HTMLElement;
}

// FIXME - No hace focus al item
// FIXME - No me permite scrollear con el mouse el emnu
export default function AutoComplete<TValue extends string | number = string | number, TData = undefined>({
  options: inputOptions,
  placeholder,
  emptyIndicator,
  value,
  onSelect,
  disabled,
  allowFreeInput = false,
  onlyInput = false,
  customOnSelectLabeling,
  onChange: onChangeProps,
  onBlur: onBlurProps,
  onValueChange,
  saveAsOption = false,
  groupBy,
  popoverContainer,
  inputWrapperClassName,
  listClassName,
  className,
  isLoading = false,
  CustomSelectItem,
  isOptionDisabled,
  ...props
}: AutoCompleteProps<TValue, TData>) {
  const valueIsOption = typeof value === 'object';

  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [inputIsFocused, setInputIsFocused] = useState(false);

  const [selected, setSelected] = useState<Option<TValue, TData> | undefined>(valueIsOption ? value : undefined);
  const [inputValue, setInputValue] = useState<string>(() => {
    if (valueIsOption) return value?.label || '';
    if (!value) return '';
    // REVIEW - Pensar si hay manera de cachear esto, capaz guardando en un ref?
    if (Array.isArray(inputOptions)) {
      const option = inputOptions.find((option) => option.value === value);
      return option?.label || String(value);
    } else {
      for (const group of Object.values(inputOptions)) {
        const option = group.find((option) => option.value === value);
        if (option) return option.label || String(value);
      }
      return String(value);
    }
  });

  // Convert the options to a GroupOption if it's an array
  const options = useMemo(() => {
    if (Array.isArray(inputOptions)) {
      return transToGroupOption(inputOptions, groupBy);
    }
    return inputOptions;
  }, [inputOptions, groupBy]);

  useEffect(() => {
    if (!value) {
      setInputValue('');
      setSelected(undefined);
    } else {
      if (typeof value === 'object') {
        setInputValue(customOnSelectLabeling?.(value) ?? value.label);
        setSelected(value);
      } else {
        let label = String(value);
        let selectedOption: Option<TValue, TData> | undefined;

        for (const group of Object.values(options)) {
          const found = group.find((o) => o.value === value);
          if (found) {
            label = found.label;
            selectedOption = found;
            break;
          }
        }

        setInputValue(label);
        setSelected(selectedOption);
      }
    }
  }, [value, customOnSelectLabeling, options]);

  const handleSelectOption = useCallback(
    (selectedOption: Option<TValue, TData>) => {
      setInputValue(customOnSelectLabeling ? customOnSelectLabeling(selectedOption) : selectedOption.label);

      setSelected(selectedOption);
      onSelect?.(selectedOption);
      onValueChange?.(selectedOption);

      onChangeProps?.({
        target: {
          value: saveAsOption ? selectedOption : selectedOption.value,
        },
      } as React.ChangeEvent<HTMLInputElement>);

      inputRef?.current?.blur();
    },
    [onSelect, onValueChange, onChangeProps, saveAsOption],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen && !onlyInput) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === 'Enter' && input.value !== '') {
        // Find the option that matches the input value across all groups
        let optionToSelect: Option<TValue, TData> | undefined;

        for (const group of Object.values(options)) {
          const foundOption = group.find((option) => option.label === input.value);
          if (foundOption) {
            optionToSelect = foundOption;
            break;
          }
        }

        if (optionToSelect) {
          handleSelectOption(optionToSelect);
        } else {
          input.blur();
        }
      }
    },
    [isOpen, options, handleSelectOption, onlyInput],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement, Element>) => {
      // Skip blur if focus is moving to the Command list (cmdk-list), e.g., when clicking its scrollbar
      const rt = (event.relatedTarget as HTMLElement | null) || (document.activeElement as HTMLElement | null);
      if (rt && (rt.hasAttribute('cmdk-list') || rt.closest('[cmdk-list]'))) {
        // Keep the popover open and restore focus to the input
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }

      setInputIsFocused(false);
      // setOpen(false);

      if (!selected && !inputValue) return;

      if (!allowFreeInput) setInputValue(selected?.label || '');
      else if (selected?.label !== inputValue) {
        // REVIEW - Pensar si tiene sentido buscar una opcion con el mismo label
        let optionToSelect: Option<TValue, TData> | undefined;

        for (const group of Object.values(options)) {
          const foundOption = group.find((option) => option.label === inputValue);
          if (foundOption) {
            optionToSelect = foundOption;
            break;
          }
        }

        if (optionToSelect) return handleSelectOption(optionToSelect);

        onChangeProps?.({
          target: {
            value: inputValue,
          },
        } as React.ChangeEvent<HTMLInputElement>);

        setSelected(undefined);
        onValueChange?.(inputValue);
      } else if (!selected) onValueChange?.(inputValue);

      onBlurProps?.(event);
    },
    [selected, inputValue, allowFreeInput, onValueChange, onChangeProps, onBlurProps, options, handleSelectOption],
  );

  return (
    <Popover open={isOpen || inputIsFocused} onOpenChange={setOpen}>
      <Command
        className="h-auto"
        // {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          // commandProps?.onKeyDown?.(e);
        }}
        // className={cn('h-fit overflow-visible bg-transparent', commandProps?.className)}
        // shouldFilter={
        //   commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch
        // }
        // When onSearch is provided, we don't want to filter the options. You can still override it.
        // filter={commandFilter()}
      >
        <PopoverAnchor asChild>
          <div className="h-full">
            <PopoverTrigger asChild>
              <CommandInput
                // {...inputProps}
                ref={inputRef}
                value={inputValue}
                disabled={disabled}
                onValueChange={(value) => {
                  setInputValue(value);
                  // inputProps?.onValueChange?.(value);
                }}
                placeholder={placeholder}
                className={cn('h-full text-base', className)}
                inputWrapperClassName={cn('h-full', inputWrapperClassName)}
                onFocus={() => {
                  // triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                  setInputIsFocused(true);
                  // inputProps?.onFocus?.(e);
                }}
                onBlur={handleBlur}
                {...props}
              />
            </PopoverTrigger>
          </div>
        </PopoverAnchor>

        <PopoverContent
          asChild
          sideOffset={4}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          onEscapeKeyDown={(e) => {
            handleBlur(e as unknown as React.FocusEvent<HTMLInputElement, Element>);
          }}
          container={popoverContainer}
        >
          <CommandList
            className={cn(
              'bg-popover text-popover-foreground animate-in w-[var(--radix-popper-anchor-width)] rounded-md border p-1 shadow-md outline-none',
              listClassName,
            )}
          >
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {Object.entries(options).map(([key, dropdowns]) => (
              <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                <>
                  {dropdowns.map((option) => {
                    const isSelected = selected?.value === option.value;
                    const disabled = isOptionDisabled?.(option) ?? option.disabled;

                    return CustomSelectItem ? (
                      <CommandPrimitive.Item
                        key={option.value}
                        value={option.label}
                        disabled={disabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => !disabled && handleSelectOption(option)}
                        asChild
                      >
                        {/* <div>
                          {option.label}
                        </div> */}
                        <CustomSelectItem option={option} isSelected={isSelected} />
                      </CommandPrimitive.Item>
                    ) : (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        disabled={disabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => !disabled && handleSelectOption(option)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2',
                          disabled && 'text-muted-foreground cursor-default',
                          !isSelected && 'pl-8',
                        )}
                      >
                        {isSelected ? <Check className="w-4 shrink-0" /> : null}

                        {option.label}
                      </CommandItem>
                    );
                  })}
                </>
              </CommandGroup>
            ))}
            {!isLoading ? (
              <CommandPrimitive.Empty className="rounded-sm px-2 py-3 text-center text-sm select-none">
                {emptyIndicator}
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
