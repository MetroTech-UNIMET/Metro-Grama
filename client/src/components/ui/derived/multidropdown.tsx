import React, { useEffect } from 'react';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { X } from 'lucide-react';

import { transToGroupOption } from '../utils/options';

import { cn } from '@/lib/utils/className';
import { useDebounceValue } from '@/hooks/shadcn.io/debounce/use-debounce-value';

import { Spinner } from '@ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { Option, GroupOption } from '../types/option.types';
import type { BaseCustomCommand } from './custom-command-items/types';

interface CommonProps {
  id?: string;
  readOnly?: boolean;
  required?: boolean;
}

export interface MultipleSelectorProps<TValue = string | number, TData = undefined> extends CommonProps {
  ref?: React.Ref<MultipleSelectorRef<TValue, TData>>;
  value?: Option<TValue, TData>[];

  defaultOptions?: Option<TValue, TData>[];
  /** manually controlled options */
  options?: Option<TValue, TData>[];
  placeholder?: string;

  /** Use if fetching options async and want to show a loading state */
  isLoading?: boolean;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   **/
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<Option<TValue, TData>[]>;
  onChange?: (options: Option<TValue, TData>[]) => void;

  /** Function called when selecting an option */
  onSelect?: (option: Option<TValue, TData>) => void;
  /** Function called when unselecting an option */
  onUnselect?: (option: Option<TValue, TData>) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Function to determine if an option should be disabled */
  isOptionDisabled?: (option: Option<TValue, TData>) => boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  listClassName?: string;
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'value' | 'placeholder' | 'disabled'
  >;

  popoverContainer?: HTMLElement;
  showSpinner?: boolean;
  /** Custom component to render more data than the value or label */
  CustomSelectItem?: React.ComponentType<BaseCustomCommand<TValue, TData>>;
}

export interface MultipleSelectorRef<TValue = string | number, TData = undefined> {
  selectedValue: Option<TValue, TData>[];
  input: HTMLInputElement;
}

function removePickedOption<TValue = string | number, TData = undefined>(
  groupOption: GroupOption<TValue, TData>,
  picked: Option<TValue, TData>[],
) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption<TValue, TData>;

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value));
  }
  return cloneOption;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      className={cn('py-6 text-center text-sm', className)}
      // eslint-disable-next-line react/no-unknown-property -- temp fix for cmdk
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
};

CommandEmpty.displayName = 'CommandEmpty';

function MultipleSelector<TValue extends string | number = string | number, TData = undefined>({
  ref,
  value,
  onChange,
  onSelect: onSelectProps,
  onUnselect,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  options: arrayOptions,
  delay,
  onSearch,
  isLoading: loadingOptions,
  loadingIndicator,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  listClassName,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  commandProps,
  inputProps,
  showSpinner = false,
  popoverContainer,
  CustomSelectItem,
  isOptionDisabled,
  ...props
}: MultipleSelectorProps<TValue, TData>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputIsFocused, setIsFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(loadingOptions || false);

  const [selected, setSelected] = React.useState<Option<TValue, TData>[]>(value || []);
  const [options, setOptions] = React.useState<GroupOption<TValue, TData>>(
    transToGroupOption<TValue, TData>(arrayDefaultOptions, groupBy),
  );
  const [inputValue, setInputValue] = React.useState('');
  const [debouncedSearchTerm] = useDebounceValue(inputValue, delay || 500);

  React.useImperativeHandle(
    ref,
    () => ({
      selectedValue: [...selected],
      input: inputRef.current as HTMLInputElement,
      focus: () => inputRef.current?.focus(),
    }),
    [selected],
  );

  const handleUnselect = React.useCallback(
    (option: Option<TValue, TData>) => {
      if (disabled || option.fixed) return;

      const newOptions = selected.filter((s) => s.value !== option.value);
      setSelected(newOptions);
      onChange?.(newOptions);
      onUnselect?.(option);
    },
    [onChange, onUnselect, selected, disabled],
  );

  const handleSelect = React.useCallback(
    (option: Option<TValue, TData>) => {
      if (selected.length >= maxSelected) {
        onMaxSelected?.(selected.length);
        return;
      }
      setInputValue('');
      const newOptions = [...selected, option];

      setSelected(newOptions);
      onChange?.(newOptions);
      onSelectProps?.(option);
    },
    [onChange, selected, maxSelected, onMaxSelected, onSelectProps],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && selected.length > 0) {
            const lastSelected = selected[selected.length - 1];
            if (!lastSelected) throw new Error('No option found to unselect');
            handleUnselect(lastSelected);
          }
        }
      }
    },
    [handleUnselect, selected],
  );

  useEffect(() => {
    if (loadingOptions === undefined) return;
    setIsLoading(loadingOptions);
  }, [loadingOptions]);

  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  useEffect(() => {
    /** If `onSearch` is provided, do not trigger options updated. */
    if (!arrayOptions || onSearch) {
      return;
    }
    const newOption = transToGroupOption<TValue, TData>(arrayOptions || [], groupBy);
    if (JSON.stringify(newOption) !== JSON.stringify(options)) {
      setOptions(newOption);
    }
  }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

  useEffect(() => {
    const doSearch = async () => {
      setIsLoading(true);
      const res = await onSearch?.(debouncedSearchTerm);
      setOptions(transToGroupOption(res || [], groupBy));
      setIsLoading(false);
    };

    const exec = async () => {
      if (!onSearch || !open) return;

      if (triggerSearchOnFocus) {
        await doSearch();
      }

      if (debouncedSearchTerm) {
        await doSearch();
      }
    };

    void exec();
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

  const CreatableItem = () => {
    if (!creatable) return undefined;

    const Item = (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onSelect={(value: string) =>
          handleSelect({
            value: value as TValue,
            label: String(value),
          })
        }
      >{`Create "${inputValue}"`}</CommandItem>
    );

    // For normal creatable
    if (!onSearch && inputValue.length > 0) {
      return Item;
    }

    // For async search creatable. avoid showing creatable item before loading at first.
    if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
      return Item;
    }

    return undefined;
  };

  const EmptyItem = React.useCallback(() => {
    if (!emptyIndicator) return undefined;

    // For async search that showing emptyIndicator
    if (onSearch && !creatable && Object.keys(options).length === 0) {
      return (
        <CommandItem value="-" disabled>
          {emptyIndicator}
        </CommandItem>
      );
    }

    return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
  }, [creatable, emptyIndicator, onSearch, options]);

  const selectables = React.useMemo<GroupOption<TValue, TData>>(
    () => removePickedOption(options, selected),
    [options, selected],
  );

  /** Avoid Creatable Selector freezing or lagging when paste a long string. */
  const commandFilter = React.useCallback(() => {
    if (commandProps?.filter) {
      return commandProps.filter;
    }

    if (creatable) {
      return (value: string, search: string) => {
        return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
      };
    }
    // Using default filter in `cmdk`. We don't have to provide it.
    return undefined;
  }, [creatable, commandProps?.filter]);

  return (
    <Popover open={open || inputIsFocused} onOpenChange={setOpen}>
      <Command
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn('h-fit overflow-visible bg-transparent', commandProps?.className)}
        shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch}
        // When onSearch is provided, we don't want to filter the options. You can still override it.
        filter={commandFilter()}
      >
        <PopoverAnchor asChild>
          <div
            className={cn(
              'border-input group rounded-md border px-4 py-2.5 text-sm',
              className,
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <div className="flex w-full flex-wrap gap-1">
              {selected.map((option) => {
                return (
                  <Badge
                    key={option.value}
                    className={cn(
                      'data-disabled:bg-muted-foreground data-disabled:text-muted data-disabled:hover:bg-muted-foreground',
                      'data-fixed:bg-muted-foreground data-fixed:text-muted data-fixed:hover:bg-muted-foreground',
                      badgeClassName,
                    )}
                    data-fixed={option.fixed === true ? true : undefined}
                    data-disabled={disabled}
                  >
                    {option.label}
                    <button
                      className={cn(
                        'ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2',
                        (disabled || option.fixed) && 'hidden',
                      )}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnselect(option);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(option)}
                    >
                      <X className="hover:text-foreground text-muted-foreground h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}

              <PopoverTrigger asChild>
                <CommandPrimitive.Input
                  {...inputProps}
                  ref={inputRef}
                  value={inputValue}
                  disabled={disabled}
                  onValueChange={(value) => {
                    setInputValue(value);
                    inputProps?.onValueChange?.(value);
                  }}
                  placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
                  className={cn(
                    'placeholder:text-muted-foreground ml-2 w-full flex-1 bg-transparent outline-none',
                    inputProps?.className,
                    disabled && 'cursor-not-allowed',
                  )}
                  onFocus={(e) => {
                    triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                    setIsFocused(true);
                    inputProps?.onFocus?.(e);
                  }}
                  onBlur={(e) => {
                    setIsFocused(false);
                    inputProps?.onBlur?.(e);
                  }}
                  {...props}
                />
              </PopoverTrigger>

              {showSpinner && <Spinner className="h-5 w-5" />}
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          asChild
          sideOffset={4}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          container={popoverContainer}
          onCloseAutoFocus={(e) => {
            // Prevent Radix from returning focus to the trigger (input)
            // so Tab can continue to the next focusable element.
            e.preventDefault();
          }}
          onEscapeKeyDown={() => {
            setIsFocused(false);
          }}
        >
          <CommandList
            className={cn(
              'bg-popover text-popover-foreground animate-in w-(--radix-popper-anchor-width) rounded-md border p-1 shadow-md outline-none',
              listClassName,
            )}
          >
            {isLoading ? (
              <>{loadingIndicator}</>
            ) : (
              <>
                {EmptyItem()}
                {CreatableItem()}
                {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                {Object.entries(selectables).map(([key, dropdowns]) => (
                  <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                    <>
                      {dropdowns.map((option) => {
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
                            onSelect={() => !disabled && handleSelect(option)}
                            asChild
                          >
                            <CustomSelectItem option={option} isSelected={false} />
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
                            onSelect={() => !disabled && handleSelect(option)}
                            className={cn('cursor-pointer', disabled && 'text-muted-foreground cursor-default')}
                          >
                            {option.label}
                          </CommandItem>
                        );
                      })}
                    </>
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;
