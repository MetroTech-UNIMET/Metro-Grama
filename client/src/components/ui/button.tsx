import * as React from 'react';
import { Slot as SlotPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/className';

const variant = {
  default: '',
  outline: 'border border-primary bg-UI-white shadow-xs',
  ghost: 'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
  link: 'text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50 bg-transparent!',
};

const colors = {
  neutral:
    // 'bg-neutral-900 text-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-50 ',
    'bg-background text-foreground hover:bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
  primary: 'bg-primary text-neutral-50 hover:bg-primary/90 active:bg-primary-900',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-600/80 active:bg-secondary-700',
  tertiary: 'bg-tertiary-600 text-white hover:bg-tertiary-600/80 active:bg-tertiary-700',
  success:
    'bg-success text-success-foreground hover:bg-green-700/90 dark:bg-green-900 dark:text-neutral-50 dark:hover:bg-green-900/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-red-700/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90',
};

const size = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'size-9',
  'big-icon': 'size-12 [&_svg]:size-6',
};

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 cursor-pointer',
  {
    variants: {
      colors,
      variant,
      size,
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      colors: 'neutral',
    },
    compoundVariants: [
      {
        colors: 'neutral',
        variant: 'outline',
        className:
          'text-neutral-900 border-neutral-900 border-2 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-50 dark:border-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
      },
      {
        colors: 'neutral',
        variant: 'ghost',
        className:
          'text-neutral-900 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-50 dark:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:active:bg-neutral-700',
      },
      {
        colors: 'neutral',
        variant: 'link',
        className: 'text-neutral-900 hover:text-neutral-700 dark:text-neutral-50 dark:hover:text-neutral-300',
      },
      {
        colors: 'secondary',
        variant: 'outline',
        className:
          'border-secondary-600 border-2 text-secondary-600 hover:bg-secondary-600 hover:text-white active:bg-secondary-100',
      },
      {
        colors: 'primary',
        variant: 'outline',
        className: 'text-neutral-900 border-primary border-2 hover:bg-primary-200 active:bg-primary-100',
      },
      {
        colors: 'primary',
        variant: 'ghost',
        className:
          'text-primary bg-transparent hover:bg-secondary/10 dark:hover:bg-secondary/20 active:bg-secondary/20 dark:active:bg-secondary/30',
      },
      {
        colors: 'secondary',
        variant: 'ghost',
        className:
          'text-secondary bg-transparent hover:bg-secondary/10 dark:hover:bg-secondary/20 active:bg-secondary/20 dark:active:bg-secondary/30',
      },

      {
        colors: 'tertiary',
        variant: 'outline',
        className:
          'text-tertiary-600 border-tertiary-600 border-2 hover:bg-tertiary-600 hover:text-white active:bg-tertiary-700',
      },

      {
        colors: 'success',
        variant: 'outline',
        className:
          'text-success border-success border-2 hover:bg-success/10 active:bg-success/20 dark:hover:bg-success/20 dark:active:bg-success/30',
      },
      {
        colors: 'success',
        variant: 'ghost',
        className:
          'text-gray-400 bg-transparent hover:bg-success/10 hover:text-success dark:hover:bg-success/20 active:bg-success/20 dark:active:bg-success/30',
      },
      {
        colors: 'destructive',
        variant: 'outline',
        className:
          'text-destructive border-destructive border-2 hover:bg-destructive/10 active:bg-destructive/20 dark:hover:bg-destructive/20 dark:active:bg-destructive/30',
      },
      {
        colors: 'destructive',
        variant: 'ghost',
        className:
          'text-gray-400 bg-transparent hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 active:bg-destructive/20 dark:active:bg-destructive/30',
      },
    ],
  },
);

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, colors, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? SlotPrimitive.Slot : 'button';
  return <Comp className={cn(buttonVariants({ colors, variant, size, className }))} {...props} />;
}

const variantsKeys = Object.keys(variant) as Array<keyof typeof variant>;
const colorsKeys = Object.keys(colors) as Array<keyof typeof colors>;
export { Button, buttonVariants, variantsKeys, colorsKeys };
