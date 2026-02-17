import React, { useState, useEffect } from 'react';
import * as RPNInput from 'react-phone-number-input';
import { parsePhoneNumberFromString, getCountryCallingCode } from 'libphonenumber-js';
import flags from 'react-phone-number-input/flags';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils/className';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export type PhoneInputProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'ref'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
    popoverContainer?: HTMLElement;
  };

export const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> = React.forwardRef<
  React.ComponentRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, defaultCountry, value, popoverContainer, ...props }, ref) => {
  const [country, setCountry] = useState<RPNInput.Country | undefined>(defaultCountry);

  useEffect(() => {
    if (value) {
      const phoneNumber = parsePhoneNumberFromString(value as string);
      if (phoneNumber) {
        setCountry(phoneNumber.country);
      }
    }
  }, [value]);

  const handleCountryChange = (newCountry: RPNInput.Country) => {
    setCountry(newCountry);
    if (value && typeof value === 'string') {
      const phoneNumber = parsePhoneNumberFromString(value);
      if (phoneNumber) {
        const newValue = `+${getCountryCallingCode(newCountry)}${phoneNumber.nationalNumber}`;
        onChange?.(newValue as RPNInput.Value);
      } else {
        onChange?.(`+${getCountryCallingCode(newCountry)}` as RPNInput.Value);
      }
    } else {
      onChange?.(`+${getCountryCallingCode(newCountry)}` as RPNInput.Value);
    }
  };

  return (
    <RPNInput.default
      ref={ref}
      className={cn('flex flex-row gap-2', className)}
      defaultCountry="VE"
      flagComponent={FlagComponent}
      countrySelectComponent={(props) => (
        <CountrySelect
          {...props}
          selectedCountry={country}
          onChange={handleCountryChange}
          container={popoverContainer}
        />
      )}
      inputComponent={InputComponent}
      smartCaret={false}
      country={country}
      onChange={(val) => onChange?.(val || ('' as RPNInput.Value))}
      value={value}
      {...props}
    />
  );
});
PhoneInput.displayName = 'PhoneInput';
const InputComponent = ({
  ref,
  className,
  ...props
}: React.ComponentProps<'input'> & {
  ref: React.RefObject<HTMLInputElement>;
}) => <Input className={cn('peer rounded-s-none rounded-e-lg', className)} {...props} ref={ref} />;
InputComponent.displayName = 'InputComponent';

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
  container?: HTMLElement;
  className?: string;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
  container,
  className,
}: CountrySelectProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'ring-secondary! flex h-auto gap-1 rounded-s-lg rounded-e-none border border-gray-100 px-3 ring-offset-2 focus:z-10 focus:ring-2',
            className,
          )}
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown className={cn('-mr-2 size-4 opacity-50', disabled ? 'hidden' : 'opacity-100')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" container={container}>
        <Command>
          <CommandInput placeholder="Buscar pais..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>Pais no encontrado.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                    />
                  ) : null,
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
}

const CountrySelectOption = ({ country, countryName, selectedCountry, onChange }: CountrySelectOptionProps) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-foreground/50 text-sm">{`+${getCountryCallingCode(country)}`}</span>
      <CheckIcon className={`ml-auto size-4 ${country === selectedCountry ? 'opacity-100' : 'opacity-0'}`} />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-4 justify-center overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
