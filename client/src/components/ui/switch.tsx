'use client';

import * as React from 'react';
import { Switch as SwitchPrimitives } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/className';

// TODO - Mejorar colores modo oscuro
const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2  disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      colors: {
        neutral:
          'bg-neutral-200 dark:bg-neutral-400 data-[state=unchecked]:bg-neutral-200 data-[state=checked]:bg-neutral-400',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-12',
        xl: 'h-8 w-16',
      },
    },
    defaultVariants: {
      colors: 'neutral',
      size: 'lg',
    },
  },
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
  {
    variants: {
      colors: {
        primary: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-white',
      },
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-6',
        xl: 'h-7 w-7 data-[state=checked]:translate-x-7',
      },
    },
    defaultVariants: {
      colors: 'primary',
      size: 'lg',
    },
  },
);

type ThumbVariants = VariantProps<typeof thumbVariants>;

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  thumbColors?: ThumbVariants['colors'];
  thumbClassName?: string;
}

function Switch({
  className,
  size,
  colors,
  thumbColors,
  thumbClassName,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        switchVariants({
          size,
          colors,
          className,
        }),
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          thumbVariants({
            size,
            colors: thumbColors,
            className: thumbClassName,
          }),
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
