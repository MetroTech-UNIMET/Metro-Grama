import { cva } from 'class-variance-authority';

export const dockContainerVariants = cva('bg-card relative inline-flex items-center rounded-xl border shadow-sm', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    size: {
      default: 'p-2',
      compact: 'p-1',
      large: 'p-3',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'default',
  },
});

export const dockItemVariants = cva(
  'relative flex flex-col items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted/50 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
  {
    variants: {
      size: {
        default: 'p-2 min-w-14',
        compact: 'p-2 min-w-12',
        large: 'p-3 min-w-16',
      },
      active: {
        true: 'text-primary',
        false: 'text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      size: 'default',
      active: false,
    },
  },
);

export const dockIconVariants = cva('transition-colors duration-200', {
  variants: {
    size: {
      default: 'h-5 w-5',
      compact: 'h-4 w-4',
      large: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const dockTextVariants = cva('font-medium capitalize transition-colors duration-200 whitespace-nowrap', {
  variants: {
    size: {
      default: 'text-sm',
      compact: 'text-xs',
      large: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type DockVariantProps = {
  variant?: 'default' | 'compact' | 'large';
  orientation?: 'horizontal' | 'vertical';
};

export function computeIndicatorOffset(index: number, variant: 'default' | 'compact' | 'large') {
  // replicate previous magic numbers for alignment
  const size = variant === 'large' ? 64 : variant === 'compact' ? 56 : 60;
  const padding = variant === 'large' ? 19 : variant === 'compact' ? 16 : 18;
  return index * size + padding;
}
